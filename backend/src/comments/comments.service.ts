import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async getComments(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  async createComment(taskId: string, authorId: string, body: string, parentId?: string) {
    const comment = await this.prisma.comment.create({
      data: { body, taskId, authorId, parentId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Activity log
    await this.prisma.activity.create({
      data: { action: 'COMMENTED', taskId, userId: authorId },
    });

    return comment;
  }

  async updateComment(id: string, body: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { body },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async deleteComment(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }
}
