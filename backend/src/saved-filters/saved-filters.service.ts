import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedFiltersService {
  constructor(private prisma: PrismaService) {}

  async list(workspaceId: string, userId: string) {
    return this.prisma.savedFilter.findMany({
      where: { workspaceId, OR: [{ userId }, { isShared: true }] },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(workspaceId: string, userId: string, data: { name: string; query: any; isShared?: boolean; projectId?: string }) {
    return this.prisma.savedFilter.create({
      data: { workspaceId, userId, name: data.name, query: data.query, isShared: data.isShared ?? false, projectId: data.projectId },
    });
  }

  async delete(id: string) {
    return this.prisma.savedFilter.delete({ where: { id } });
  }
}
