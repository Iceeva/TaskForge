import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SprintsService {
  constructor(private prisma: PrismaService) {}

  async list(projectId: string) {
    return this.prisma.sprint.findMany({
      where: { projectId },
      orderBy: { startDate: 'desc' },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { id: true, isCompleted: true } },
      },
    });
  }

  async get(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
          include: {
            assignments: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
            column: true,
          },
        },
      },
    });
    if (!sprint) throw new NotFoundException('Sprint not found');
    return sprint;
  }

  async create(projectId: string, data: { name: string; goal?: string; startDate: string; endDate: string }) {
    return this.prisma.sprint.create({
      data: {
        name: data.name,
        goal: data.goal,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        projectId,
      },
    });
  }

  async update(id: string, data: Partial<{ name: string; goal: string; startDate: string; endDate: string; isActive: boolean; isCompleted: boolean }>) {
    const updates: any = { ...data };
    if (data.startDate) updates.startDate = new Date(data.startDate);
    if (data.endDate) updates.endDate = new Date(data.endDate);

    // Only one active sprint per project at a time
    if (data.isActive) {
      const sprint = await this.prisma.sprint.findUnique({ where: { id } });
      if (sprint) {
        await this.prisma.sprint.updateMany({
          where: { projectId: sprint.projectId, id: { not: id } },
          data: { isActive: false },
        });
      }
    }

    return this.prisma.sprint.update({ where: { id }, data: updates });
  }

  async delete(id: string) {
    return this.prisma.sprint.delete({ where: { id } });
  }

  async burndown(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
      include: { tasks: { select: { id: true, isCompleted: true, completedAt: true, estimatedHours: true, createdAt: true } } },
    });
    if (!sprint) throw new NotFoundException('Sprint not found');

    const totalPoints = sprint.tasks.reduce((sum, t) => sum + (t.estimatedHours ?? 1), 0);
    const days: { date: string; remaining: number }[] = [];
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const dayMs = 24 * 60 * 60 * 1000;

    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + dayMs)) {
      const completedByDay = sprint.tasks.filter(
        (t) => t.isCompleted && t.completedAt && new Date(t.completedAt) <= d,
      );
      const completedPoints = completedByDay.reduce((sum, t) => sum + (t.estimatedHours ?? 1), 0);
      days.push({ date: d.toISOString().slice(0, 10), remaining: Math.max(totalPoints - completedPoints, 0) });
    }

    return { totalPoints, days };
  }
}
