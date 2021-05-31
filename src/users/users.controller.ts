import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { Users } from "../entities/Users.entity";
import { CreateUserDto } from "../dtos/create-user.dto";

import { InjectRepository } from "@nestjs/typeorm";
import { getConnection, Repository } from "typeorm";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Body() body, @Res({ passthrough: true }) res): Promise<any> {
    const userDatas = await this.usersService.findAll();

    if (userDatas !== undefined) {
      res.status(200).send(userDatas);
    } else {
      res.status(400);
    }
  }
  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Res({ passthrough: true }) res,
  ): Promise<any> {
    const userDatas = await this.usersService.findOne(id);

    if (userDatas !== undefined) {
      res.status(200).send(userDatas);
    } else {
      res.status(400);
    }
  }
}
