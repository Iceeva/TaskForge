import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async projectOverview(projectId: string) {
    const [tasks, columns] = await Promise.all([
      this.prisma.task.findMany({
        where: { projectId },
        select: {
          id: true,
          isCompleted: true,
          priority: true,
          dueDate: true,
          completedAt: true,
          createdAt: true,
          columnId: true,
          estimatedHours: true,
          assignments: { select: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        },
      }),
      this.prisma.column.findMany({ where: { projectId }, orderBy: { position: 'asc' } }),
    ]);

    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const overdue = tasks.filter((t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < now).length;
    const dueSoon = tasks.filter(
      (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= new Date(now.getTime() + 3 * 86400000),
    ).length;

    const byPriority: Record<string, number> = {};
    for (const t of tasks) byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;

    const byColumn = columns.map((c) => ({
      columnId: c.id,
      name: c.name,
      color: c.color,
      count: tasks.filter((t) => t.columnId === c.id).length,
    }));

    const byAssignee = new Map<string, { user: any; total: number; completed: number }>();
    for (const t of tasks) {
      for (const a of t.assignments) {
        const key = a.user.id;
        if (!byAssignee.has(key)) byAssignee.set(key, { user: a.user, total: 0, completed: 0 });
        const entry = byAssignee.get(key)!;
        entry.total += 1;
        if (t.isCompleted) entry.completed += 1;
      }
    }

    // Completion trend, last 14 days
    const trend: { date: string; completed: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 86400000);
      const dayStr = day.toISOString().slice(0, 10);
      const count = tasks.filter((t) => t.completedAt && new Date(t.completedAt).toISOString().slice(0, 10) === dayStr).length;
      trend.push({ date: dayStr, completed: count });
    }

    return {
      total,
      completed,
      overdue,
      dueSoon,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      byPriority,
      byColumn,
      byAssignee: Array.from(byAssignee.values()),
      trend,
      totalEstimatedHours: tasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0),
    };
  }

  async workspaceOverview(workspaceId: string) {
    const projects = await this.prisma.project.findMany({
      where: { workspaceId, isArchived: false },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { isCompleted: true, dueDate: true } },
      },
    });

    return projects.map((p) => {
      const now = new Date();
      const completed = p.tasks.filter((t) => t.isCompleted).length;
      const overdue = p.tasks.filter((t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < now).length;
      return {
        id: p.id,
        name: p.name,
        icon: p.icon,
        color: p.color,
        total: p.tasks.length,
        completed,
        overdue,
        completionRate: p.tasks.length ? Math.round((completed / p.tasks.length) * 100) : 0,
      };
    });
  }
}
