import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(workspaceId: string, query: string) {
    if (!query || query.trim().length < 2) {
      return { tasks: [], projects: [], comments: [] };
    }

    const [tasks, projects, comments] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          project: { workspaceId },
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        include: { project: { select: { id: true, name: true, icon: true, color: true } }, column: true },
      }),
      this.prisma.project.findMany({
        where: {
          workspaceId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      this.prisma.comment.findMany({
        where: {
          task: { project: { workspaceId } },
          body: { contains: query, mode: 'insensitive' },
        },
        take: 5,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          task: { select: { id: true, title: true, projectId: true } },
        },
      }),
    ]);

    return { tasks, projects, comments };
  }
}
