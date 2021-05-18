import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Users } from "../entities/Users.entity";
import { CreateUserDto } from "../dtos/create-user.dto";

import { InjectRepository } from "@nestjs/typeorm";
import { getConnection, Repository } from "typeorm";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("signup")
  create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<Users[]> {
    return this.usersService.findAll();
  }
  // /를 이용한 분기.
  @Get(":id")
  findOne(@Param("id") id: string): Promise<Users> {
    return this.usersService.findOne(id);
  }
}
