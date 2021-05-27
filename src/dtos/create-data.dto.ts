import { IsString } from "class-validator";

export class CreateDataDto {
  @IsString()
  tag: string;

  @IsString()
  sticker: string;

  @IsString()
  box_color: string;

  @IsString()
  back_color: string;

  @IsString()
  today_learning_time: number;

  @IsString()
  d_day: number;

  @IsString()
  comment: string;

  @IsString()
  thumbs_up: number;
}
