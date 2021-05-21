import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Users } from '../entities/Users.entity';
import { CreateUserDto } from '../dtos/create-user.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<Users[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Users> {
    return this.usersService.findOne(id);
  }
}
