import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { jwtRefreshSecret } from '../config/env';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: { email, name, passwordHash: hash },
    });

    // Create default workspace
    const slug = `${(name || email.split('@')[0]).toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    const workspace = await this.prisma.workspace.create({
      data: { name: `${name || email.split('@')[0]}'s Workspace`, slug },
    });

    await this.prisma.member.create({
      data: { userId: user.id, workspaceId: workspace.id, role: 'OWNER' },
    });

    // Create default project with columns
    const project = await this.prisma.project.create({
      data: { name: 'My First Project', icon: '📋', workspaceId: workspace.id },
    });

    const defaultColumns = ['Backlog', 'To Do', 'In Progress', 'Done'];
    const colors = ['#6b7280', '#3b82f6', '#f59e0b', '#10b981'];
    for (let i = 0; i < defaultColumns.length; i++) {
      await this.prisma.column.create({
        data: { name: defaultColumns[i], color: colors[i], position: i, projectId: project.id, isDefault: i === 1 },
      });
    }

    const tokens = this.generateTokens(user.id, user.email);
    return { user: this.sanitizeUser(user), workspace, ...tokens };
  }

  async login(email: string, password: string, twoFactorCode?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorCode) return { requires2FA: true };
      const valid2FA = authenticator.verify({ token: twoFactorCode, secret: user.twoFactorSecret });
      if (!valid2FA) throw new UnauthorizedException('Invalid 2FA code');
    }

    const memberships = await this.prisma.member.findMany({
      where: { userId: user.id },
      include: { workspace: true },
    });

    const tokens = this.generateTokens(user.id, user.email);
    return {
      user: this.sanitizeUser(user),
      workspaces: memberships.map(m => ({ ...m.workspace, role: m.role })),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: jwtRefreshSecret(),
      });
      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async setup2FA(userId: string) {
    const secret = authenticator.generateSecret();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const otpauthUrl = authenticator.keyuri(user!.email, 'TaskForge', secret);

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return { secret, otpauthUrl };
  }

  async verify2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) throw new UnauthorizedException('Setup 2FA first');

    const valid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
    if (!valid) throw new UnauthorizedException('Invalid 2FA code');

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { success: true };
  }

  private generateTokens(userId: string, email: string) {
    const accessToken = this.jwt.sign({ sub: userId, email });
    const refreshToken = this.jwt.sign({ sub: userId, email }, {
      secret: jwtRefreshSecret(),
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, twoFactorSecret, ...safe } = user;
    return safe;
  }
}
