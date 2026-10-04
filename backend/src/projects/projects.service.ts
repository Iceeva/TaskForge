import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../common/access.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService, private access: AccessService) {}

  async getProjects(workspaceId: string, userId: string) {
    await this.access.workspace(workspaceId, userId);
    return this.prisma.project.findMany({
      where: { workspaceId, isArchived: false },
      include: { _count: { select: { tasks: true } } },
      orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getProject(id: string, userId: string) {
    await this.access.project(id, userId);
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

  async createProject(workspaceId: string, data: { name: string; description?: string; icon?: string; color?: string }, userId: string) {
    await this.access.workspace(workspaceId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
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

    return this.getProject(project.id, userId);
  }

  async updateProject(id: string, data: any, userId: string) {
    await this.access.project(id, userId, ['OWNER', 'ADMIN', 'MEMBER']);
    // Liste blanche : on n'accepte pas workspaceId, id, etc. depuis le client
    const { name, description, icon, color, isFavorite, isArchived } = data ?? {};
    data = Object.fromEntries(
      Object.entries({ name, description, icon, color, isFavorite, isArchived }).filter(([, v]) => v !== undefined),
    );
    return this.prisma.project.update({ where: { id }, data });
  }

  async deleteProject(id: string, userId: string) {
    await this.access.project(id, userId, ['OWNER', 'ADMIN']);
    return this.prisma.project.delete({ where: { id } });
  }

  async createColumn(projectId: string, data: { name: string; color?: string }, userId: string) {
    await this.access.project(projectId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
    const { name, color } = data;
    const maxPos = await this.prisma.column.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return this.prisma.column.create({
      data: { name, color, projectId, position: (maxPos?.position ?? -1) + 1 },
    });
  }

  async updateColumn(id: string, data: { name?: string; color?: string; position?: number }, userId: string) {
    await this.access.column(id, userId, ['OWNER', 'ADMIN', 'MEMBER']);
    const { name, color, position } = data ?? {};
    return this.prisma.column.update({
      where: { id },
      data: Object.fromEntries(Object.entries({ name, color, position }).filter(([, v]) => v !== undefined)),
    });
  }

  async deleteColumn(id: string, userId: string) {
    await this.access.column(id, userId, ['OWNER', 'ADMIN']);
    return this.prisma.column.delete({ where: { id } });
  }

  async reorderColumns(projectId: string, columnIds: string[], userId: string) {
    await this.access.project(projectId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
    // Une seule transaction (important en serverless) et uniquement les colonnes de CE projet
    await this.prisma.$transaction(
      columnIds.map((id, i) =>
        this.prisma.column.updateMany({ where: { id, projectId }, data: { position: i } }),
      ),
    );
    return { success: true };
  }
}
