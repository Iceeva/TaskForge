import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async getUserWorkspaces(userId: string) {
    const memberships = await this.prisma.member.findMany({
      where: { userId },
      include: {
        workspace: {
          include: { _count: { select: { members: true, projects: true } } },
        },
      },
    });
    return memberships.map(m => ({ ...m.workspace, role: m.role }));
  }

  async getWorkspace(id: string, userId: string) {
    await this.checkAccess(id, userId);
    return this.prisma.workspace.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        projects: { where: { isArchived: false }, orderBy: { createdAt: 'desc' } },
        labels: true,
        teams: true,
      },
    });
  }

  async updateWorkspace(id: string, userId: string, data: { name?: string; slug?: string }) {
    await this.checkAccess(id, userId, ['OWNER', 'ADMIN']);
    return this.prisma.workspace.update({ where: { id }, data });
  }

  async inviteMember(workspaceId: string, userId: string, email: string, role: any) {
    await this.checkAccess(workspaceId, userId, ['OWNER', 'ADMIN']);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      const isMember = await this.prisma.member.findUnique({
        where: { userId_workspaceId: { userId: existing.id, workspaceId } },
      });
      if (isMember) throw new ForbiddenException('Already a member');
    }

    return this.prisma.invitation.create({
      data: { email, role, workspaceId, expiresAt: new Date(Date.now() + 7 * 86400000) },
    });
  }

  async removeMember(workspaceId: string, userId: string, memberId: string) {
    await this.checkAccess(workspaceId, userId, ['OWNER', 'ADMIN']);
    return this.prisma.member.delete({ where: { id: memberId } });
  }

  async updateMemberRole(workspaceId: string, userId: string, memberId: string, role: any) {
    await this.checkAccess(workspaceId, userId, ['OWNER']);
    return this.prisma.member.update({ where: { id: memberId }, data: { role } });
  }

  private async checkAccess(workspaceId: string, userId: string, requiredRoles?: string[]) {
    const member = await this.prisma.member.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw new NotFoundException('Workspace not found');
    if (requiredRoles && !requiredRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return member;
  }
}
