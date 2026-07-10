import type { UserDto } from 'src/users/dto/user.dto';

export class AuthResponseDto {
  accessToken: string;
  user: UserDto;
}
