import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  async list(workspaceId: string) {
    return this.prisma.apiKey.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, createdAt: true },
    });
  }

  async create(workspaceId: string, name: string) {
    const rawKey = `tfk_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.slice(0, 12);

    await this.prisma.apiKey.create({
      data: { workspaceId, name, keyHash, keyPrefix },
    });

    // Raw key is only ever returned once, at creation time
    return { key: rawKey, keyPrefix };
  }

  async revoke(id: string) {
    return this.prisma.apiKey.delete({ where: { id } });
  }

  async verify(rawKey: string) {
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await this.prisma.apiKey.findFirst({ where: { keyHash } });
    if (apiKey) {
      await this.prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
    }
    return apiKey;
  }
}
