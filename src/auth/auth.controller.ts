import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { ResponseEntity } from '../interfaces/response.entity';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import type { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { responseMapping } from '../utils/response-map.util';
import { AuthService } from './auth.service';
import type { CurrentUserPayload } from './decorators/current-user.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<ResponseEntity<AuthResponseDto>> {
    return responseMapping(await this.authService.register(dto), null);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<ResponseEntity<AuthResponseDto>> {
    return responseMapping(await this.authService.login(dto), null);
  }

  @ApiOperation({ summary: 'Request a password reset link' })
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<ResponseEntity<{ message: string }>> {
    await this.authService.forgotPassword(dto);
    return responseMapping(
      {
        message: 'If that email is registered, you will receive a reset link.',
      },
      null,
    );
  }

  @ApiOperation({ summary: 'Reset password using token from email' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ResponseEntity<{ message: string }>> {
    await this.authService.resetPassword(dto);
    return responseMapping({ message: 'Password updated successfully.' }, null);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: CurrentUserPayload): Promise<ResponseEntity<UserDto>> {
    const found = await this.usersService.findById(user.id);
    if (!found) throw new NotFoundException('User not found');
    return responseMapping(this.usersService.toDto(found), null);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<ResponseEntity<UserDto>> {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return responseMapping(this.usersService.toDto(updated), null);
  }
}
