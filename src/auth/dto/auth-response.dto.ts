import type { UserDto } from '../../users/dto/user.dto';

export class AuthResponseDto {
  accessToken: string;
  user: UserDto;
}
