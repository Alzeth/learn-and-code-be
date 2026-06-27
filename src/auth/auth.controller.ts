import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload): ResponseEntity<UserDto> {
    return responseMapping(user, null);
  }
}
