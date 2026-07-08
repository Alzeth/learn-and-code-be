import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { CurrentUserPayload } from './decorators/current-user.decorator';
import { responseMapping } from 'src/utils/response-map.util';
import type { ResponseEntity } from 'src/interfaces/response.entity';
import { UserDto } from '../users/dto/user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
  ): Promise<ResponseEntity<AuthResponseDto>> {
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
      { message: 'If that email is registered, you will receive a reset link.' },
      null,
    );
  }

  @ApiOperation({ summary: 'Reset password using token from email' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<ResponseEntity<{ message: string }>> {
    await this.authService.resetPassword(dto);
    return responseMapping({ message: 'Password updated successfully.' }, null);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload): ResponseEntity<UserDto> {
    return responseMapping(user, null);
  }
}
