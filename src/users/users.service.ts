import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { Users } from "../entities/Users.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { compare, hash } from "bcrypt";
import { Repository } from "typeorm";
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
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
  }
}
