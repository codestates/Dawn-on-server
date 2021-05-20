import { IsString } from 'class-validator';

export class CreateLoginDto {
  @IsString()
  user_id: string;

  @IsString()
  user_password: string;
}
