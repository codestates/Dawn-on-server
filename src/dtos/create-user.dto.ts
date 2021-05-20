import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  user_id: string;

  @IsString()
  user_password: string;

  @IsString()
  user_nickname: string;

  @IsString()
  user_job: string;

  //   @IsString({default:null})
  //   user_img: string;

  //   @IsString()
  //   profile_comment: string;

  //   @IsString()
  //   scrap_planer: string;
}
