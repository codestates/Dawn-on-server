<<<<<<< HEAD
import { Body, Controller, Get, Post } from "@nestjs/common";
import { userInfo } from "os";
import { Users } from "src/entities/Users.entity";
import { UsersService } from "src/users/users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post("signup")
  async saveUser(@Body() users: Users): Promise<string> {
    await this.usersService.signUp(users);

    return "회원가입 되었습니다.";
=======
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Users } from '../entities/Users.entity';
import { CreateUserDto } from '../dtos/create-user.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<any> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<Users[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Users> {
    return this.usersService.findOne(id);
>>>>>>> fea9685f4b300d8cf68bd48c60a6aaaf404f5e34
  }
}
