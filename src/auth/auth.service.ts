import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';

import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create(dto.email, passwordHash);

    return {
      accessToken: this.signToken(user.id, user.email),
      user: { id: user.id, email: user.email },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return {
      accessToken: this.signToken(user.id, user.email),
      user: { id: user.id, email: user.email },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.users.findByEmail(dto.email);
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.users.setResetToken(user.id, tokenHash, expiresAt);
    await this.mail.sendPasswordReset(user.email, token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const user = await this.users.findByResetToken(tokenHash);
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.users.updatePasswordAndClearToken(user.id, passwordHash);
  }

  private signToken(userId: string, email: string): string {
    return this.jwt.sign({ sub: userId, email });
  }
}
