import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeTrackingService {
  constructor(private prisma: PrismaService) {}

  async listForTask(taskId: string) {
    return this.prisma.timeEntry.findMany({
      where: { taskId },
      orderBy: { date: 'desc' },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async logTime(taskId: string, userId: string, data: { minutes: number; note?: string; date?: string }) {
    return this.prisma.timeEntry.create({
      data: {
        taskId,
        userId,
        minutes: data.minutes,
        note: data.note,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async deleteEntry(id: string) {
    return this.prisma.timeEntry.delete({ where: { id } });
  }

  async taskTotal(taskId: string) {
    const result = await this.prisma.timeEntry.aggregate({
      where: { taskId },
      _sum: { minutes: true },
    });
    return { taskId, totalMinutes: result._sum.minutes ?? 0 };
  }

  async projectSummary(projectId: string) {
    const entries = await this.prisma.timeEntry.findMany({
      where: { task: { projectId } },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    const byUser = new Map<string, { user: any; minutes: number }>();
    for (const e of entries) {
      const key = e.userId;
      if (!byUser.has(key)) byUser.set(key, { user: e.user, minutes: 0 });
      byUser.get(key)!.minutes += e.minutes;
    }

    return {
      totalMinutes: entries.reduce((s, e) => s + e.minutes, 0),
      byUser: Array.from(byUser.values()),
    };
  }
}
