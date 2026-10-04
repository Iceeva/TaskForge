import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

/**
 * Vérifie qu'un utilisateur appartient bien au workspace d'une ressource.
 * Renvoie 404 (et non 403) quand l'utilisateur n'est pas membre, pour ne pas
 * révéler l'existence d'un identifiant.
 */
@Injectable()
export class AccessService {
  constructor(private prisma: PrismaService) {}

  async workspace(workspaceId: string, userId: string, roles?: MemberRole[]) {
    const member = await this.prisma.member.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw new NotFoundException('Resource not found');
    if (roles && !roles.includes(member.role as MemberRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return member;
  }

  async project(projectId: string, userId: string, roles?: MemberRole[]) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, workspaceId: true },
    });
    if (!project) throw new NotFoundException('Resource not found');
    await this.workspace(project.workspaceId, userId, roles);
    return project;
  }

  async column(columnId: string, userId: string, roles?: MemberRole[]) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      select: { id: true, projectId: true },
    });
    if (!column) throw new NotFoundException('Resource not found');
    await this.project(column.projectId, userId, roles);
    return column;
  }
}
