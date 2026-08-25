import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  async list(projectId: string) {
    return this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { dueDate: 'asc' },
      include: {
        tasks: { select: { id: true, isCompleted: true } },
        _count: { select: { tasks: true } },
      },
    });
  }

  async get(id: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignments: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
          },
        },
      },
    });
    if (!milestone) throw new NotFoundException('Milestone not found');
    return milestone;
  }

  async create(projectId: string, data: { name: string; description?: string; dueDate?: string; color?: string }) {
    return this.prisma.milestone.create({
      data: {
        name: data.name,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        color: data.color,
        projectId,
      },
    });
  }

  async update(id: string, data: Partial<{ name: string; description: string; dueDate: string; color: string; isCompleted: boolean }>) {
    const updates: any = { ...data };
    if (data.dueDate) updates.dueDate = new Date(data.dueDate);
    return this.prisma.milestone.update({ where: { id }, data: updates });
  }

  async delete(id: string) {
    return this.prisma.milestone.delete({ where: { id } });
  }
}
