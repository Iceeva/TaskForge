import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async getTasks(projectId: string, filters?: { columnId?: string; priority?: string; assigneeId?: string; search?: string }) {
    const where: any = { projectId };
    if (filters?.columnId) where.columnId = filters.columnId;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.assigneeId) where.assignments = { some: { userId: filters.assigneeId } };
    if (filters?.search) where.title = { contains: filters.search, mode: 'insensitive' };

    return this.prisma.task.findMany({
      where,
      orderBy: { position: 'asc' },
      include: {
        assignments: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        labels: { include: { label: true } },
        subtasks: { select: { id: true, title: true, isCompleted: true } },
        checklist: { orderBy: { position: 'asc' } },
        _count: { select: { comments: true, attachments: true, subtasks: true } },
      },
    });
  }

  async getTask(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignments: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        labels: { include: { label: true } },
        subtasks: {
          orderBy: { position: 'asc' },
          include: {
            assignments: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
          },
        },
        checklist: { orderBy: { position: 'asc' } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
            replies: {
              include: { author: { select: { id: true, name: true, avatarUrl: true } } },
            },
          },
        },
        attachments: { orderBy: { createdAt: 'desc' } },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        column: true,
        project: true,
        sprint: true,
        milestone: true,
        timeEntries: {
          orderBy: { date: 'desc' },
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        blocking: { include: { task: { select: { id: true, title: true, isCompleted: true } } } },
        blockedBy: { include: { dependsOn: { select: { id: true, title: true, isCompleted: true } } } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async createTask(data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    startDate?: string;
    projectId: string;
    columnId: string;
    parentId?: string;
    assigneeIds?: string[];
    labelIds?: string[];
  }, userId: string) {
    const maxPos = await this.prisma.task.findFirst({
      where: { projectId: data.projectId, columnId: data.columnId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: (data.priority as any) || 'NONE',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        projectId: data.projectId,
        columnId: data.columnId,
        parentId: data.parentId,
        position: (maxPos?.position ?? -1) + 1,
      },
    });

    // Assignments
    if (data.assigneeIds?.length) {
      await this.prisma.taskAssignment.createMany({
        data: data.assigneeIds.map(uid => ({ taskId: task.id, userId: uid })),
      });
    }

    // Labels
    if (data.labelIds?.length) {
      await this.prisma.taskLabel.createMany({
        data: data.labelIds.map(lid => ({ taskId: task.id, labelId: lid })),
      });
    }

    // Activity log
    await this.logActivity(task.id, userId, 'CREATED', null, null, task.title);

    return this.getTask(task.id);
  }

  async updateTask(id: string, data: any, userId: string) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Task not found');

    const updates: any = {};
    const fieldsToTrack = ['title', 'description', 'priority', 'columnId', 'sprintId', 'milestoneId'];

    for (const field of fieldsToTrack) {
      if (data[field] !== undefined && data[field] !== existing[field]) {
        await this.logActivity(id, userId, 'UPDATED', field, existing[field], data[field]);
        updates[field] = data[field];
      }
    }

    if (data.dueDate !== undefined) updates.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.startDate !== undefined) updates.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.estimatedHours !== undefined) updates.estimatedHours = data.estimatedHours;
    if (data.isCompleted !== undefined) {
      updates.isCompleted = data.isCompleted;
      updates.completedAt = data.isCompleted ? new Date() : null;
      await this.logActivity(id, userId, data.isCompleted ? 'COMPLETED' : 'REOPENED');
    }

    return this.prisma.task.update({
      where: { id },
      data: updates,
      include: {
        assignments: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        labels: { include: { label: true } },
        column: true,
      },
    });
  }

  async moveTask(id: string, columnId: string, position: number, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    // Reorder other tasks in target column
    await this.prisma.task.updateMany({
      where: { columnId, position: { gte: position } },
      data: { position: { increment: 1 } },
    });

    const updated = await this.prisma.task.update({
      where: { id },
      data: { columnId, position },
    });

    if (task.columnId !== columnId) {
      await this.logActivity(id, userId, 'MOVED', 'column', task.columnId, columnId);
    }

    return updated;
  }

  async deleteTask(id: string, userId: string) {
    await this.logActivity(id, userId, 'DELETED');
    return this.prisma.task.delete({ where: { id } });
  }

  async assignTask(taskId: string, userId: string, assignerId: string) {
    const assignment = await this.prisma.taskAssignment.create({
      data: { taskId, userId },
    });
    await this.logActivity(taskId, assignerId, 'ASSIGNED', null, null, userId);
    return assignment;
  }

  async unassignTask(taskId: string, userId: string, unassignerId: string) {
    await this.prisma.taskAssignment.delete({
      where: { taskId_userId: { taskId, userId } },
    });
    await this.logActivity(taskId, unassignerId, 'UNASSIGNED', null, userId, null);
  }

  async addLabel(taskId: string, labelId: string) {
    return this.prisma.taskLabel.create({ data: { taskId, labelId } });
  }

  async removeLabel(taskId: string, labelId: string) {
    return this.prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }

  async addChecklistItem(taskId: string, text: string) {
    const maxPos = await this.prisma.checklistItem.findFirst({
      where: { taskId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return this.prisma.checklistItem.create({
      data: { text, taskId, position: (maxPos?.position ?? -1) + 1 },
    });
  }

  async toggleChecklistItem(id: string) {
    const item = await this.prisma.checklistItem.findUnique({ where: { id } });
    return this.prisma.checklistItem.update({
      where: { id },
      data: { completed: !item?.completed },
    });
  }

  async deleteChecklistItem(id: string) {
    return this.prisma.checklistItem.delete({ where: { id } });
  }

  private async logActivity(taskId: string, userId: string, action: string, field?: string | null, oldValue?: any, newValue?: any) {
    await this.prisma.activity.create({
      data: {
        action,
        field: field || undefined,
        oldValue: oldValue != null ? String(oldValue) : undefined,
        newValue: newValue != null ? String(newValue) : undefined,
        taskId,
        userId,
      },
    });
  }

  // ─── Dependencies ─────────────────────────────
  async addDependency(taskId: string, dependsOnId: string, type: 'BLOCKS' | 'RELATES_TO' = 'BLOCKS') {
    if (taskId === dependsOnId) {
      throw new NotFoundException('A task cannot depend on itself');
    }
    return this.prisma.taskDependency.create({
      data: { taskId, dependsOnId, type: type as any },
    });
  }

  async removeDependency(dependencyId: string) {
    return this.prisma.taskDependency.delete({ where: { id: dependencyId } });
  }

  // ─── Export ───────────────────────────────────
  async exportProjectCsv(projectId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
      include: {
        column: { select: { name: true } },
        assignments: { include: { user: { select: { name: true, email: true } } } },
        labels: { include: { label: { select: { name: true } } } },
      },
    });

    const header = ['Title', 'Column', 'Priority', 'Status', 'Assignees', 'Labels', 'Due Date', 'Estimated Hours'];
    const rows = tasks.map((t) => [
      csvEscape(t.title),
      csvEscape(t.column?.name ?? ''),
      t.priority,
      t.isCompleted ? 'Completed' : 'Open',
      csvEscape(t.assignments.map((a) => a.user.name || a.user.email).join('; ')),
      csvEscape(t.labels.map((l) => l.label.name).join('; ')),
      t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : '',
      t.estimatedHours ?? '',
    ]);

    return [header, ...rows].map((r) => r.join(',')).join('\n');
  }
}

function csvEscape(value: string): string {
  if (value == null) return '';
  const needsQuoting = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}
