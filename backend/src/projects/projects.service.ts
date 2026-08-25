import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getProjects(workspaceId: string) {
    return this.prisma.project.findMany({
      where: { workspaceId, isArchived: false },
      include: { _count: { select: { tasks: true } } },
      orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                assignments: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
                labels: { include: { label: true } },
                subtasks: { select: { id: true, isCompleted: true } },
                _count: { select: { comments: true, attachments: true } },
              },
            },
          },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async createProject(workspaceId: string, data: { name: string; description?: string; icon?: string; color?: string }) {
    const project = await this.prisma.project.create({
      data: { ...data, workspaceId },
    });

    // Default columns
    const defaults = [
      { name: 'Backlog', color: '#6b7280', position: 0 },
      { name: 'To Do', color: '#3b82f6', position: 1, isDefault: true },
      { name: 'In Progress', color: '#f59e0b', position: 2 },
      { name: 'Done', color: '#10b981', position: 3 },
    ];

    for (const col of defaults) {
      await this.prisma.column.create({ data: { ...col, projectId: project.id } });
    }

    return this.getProject(project.id);
  }

  async updateProject(id: string, data: any) {
    return this.prisma.project.update({ where: { id }, data });
  }

  async deleteProject(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  async createColumn(projectId: string, data: { name: string; color?: string }) {
    const maxPos = await this.prisma.column.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return this.prisma.column.create({
      data: { ...data, projectId, position: (maxPos?.position ?? -1) + 1 },
    });
  }

  async updateColumn(id: string, data: { name?: string; color?: string; position?: number }) {
    return this.prisma.column.update({ where: { id }, data });
  }

  async deleteColumn(id: string) {
    return this.prisma.column.delete({ where: { id } });
  }

  async reorderColumns(projectId: string, columnIds: string[]) {
    for (let i = 0; i < columnIds.length; i++) {
      await this.prisma.column.update({
        where: { id: columnIds[i] },
        data: { position: i },
      });
    }
    return { success: true };
  }
}
