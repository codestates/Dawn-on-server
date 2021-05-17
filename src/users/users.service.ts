<<<<<<< HEAD
import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { Users } from "../entities/Users.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { compare, hash } from "bcrypt";
import { Repository } from "typeorm";
=======
import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { Users } from '../entities/Users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';

>>>>>>> fea9685f4b300d8cf68bd48c60a6aaaf404f5e34
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
<<<<<<< HEAD
    private userRepository: Repository<Users>
  ) {
    this.userRepository = userRepository;
  }

  async findUserWithUserId(user_id: string): Promise<Users> {
    return await this.userRepository.findOne({ where: { id: user_id } });
  }

  async findUserWithNickname(user_nickname: string): Promise<Users> {
    return await this.userRepository.findOne({ where: { user_nickname } });
  }

  async signUp(users: Users, provider?: string): Promise<Users> {
    const { user_id, user_nickname } = users;
    let existingUser = await this.findUserWithUserId(user_id);

    if (existingUser) {
      throw new UnprocessableEntityException("이미 존재하는 아이디 입니다.");
    } else {
      existingUser = await this.findUserWithNickname(user_nickname);
      return await this.userRepository.save(users);
    }

    /*     if (provider) {
      users.user_password = await hash(Math.random().toString(36), 10);
    } else {
      users.user_password = await hash(users.user_password, 10);
    } */
=======
    private usersRepository: Repository<Users>,
  ) {}
  //   private users: Users[] = []; // 데이터베이스 정보를 넣으면 됌.

  async create(createUserDto): Promise<void> {
    const isExist = await this.usersRepository.findOne({
      user_id: createUserDto.user_id,
    });
    if (isExist) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `이미 등록된 사용자입니다.`,
        error: `상태코드:${HttpStatus.FORBIDDEN}`,
      });
    }
    const { user_password, ...result } = await this.usersRepository.save(
      createUserDto,
    );
    return result;
  }

  findAll(): Promise<Users[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<Users> {
    return this.usersRepository.findOne({ user_id: id });
  }

  async update(createUserDto): Promise<void> {
    const newUsers = await this.usersRepository.findOne(createUserDto.id);
    newUsers.user_nickname = createUserDto.user_nickname;
    newUsers.user_img = createUserDto.user_img;
    newUsers.user_job = createUserDto.user_job;
    newUsers.user_password = createUserDto.user_password;
    await this.usersRepository.save(newUsers);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
>>>>>>> fea9685f4b300d8cf68bd48c60a6aaaf404f5e34
  }
}
