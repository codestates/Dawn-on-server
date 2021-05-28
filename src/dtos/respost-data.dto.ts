import { IsString } from "class-validator";

export class RespostDataDto {
  @IsString()
  date: Date;

  @IsString()
  todos: any[];

  @IsString()
  tags: any[];

  @IsString()
  back_color: string;

  @IsString()
  sticker: string;

  @IsString()
  comment: string;

  @IsString()
  memo: string;

  @IsString()
  thumbs_up: number;

  @IsString()
  today_learning_time: number;
}
