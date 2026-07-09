import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(email: string, passwordHash: string): Promise<User> {
    return this.prisma.user.create({ data: { email, passwordHash } });
  }

  async setResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: tokenHash,
        passwordResetTokenExpiresAt: expiresAt,
      },
    });
  }

  async findByResetToken(tokenHash: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetTokenExpiresAt: { gt: new Date() },
      },
    });
  }

  async updatePasswordAndClearToken(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
      },
    });
  }
}
