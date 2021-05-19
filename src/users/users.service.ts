import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
import { Users } from "../entities/Users.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { getConnection, Repository } from "typeorm";
import { bcryptConstant } from "../contants";

import { hash } from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>
  ) {}
  //   private users: Users[] = []; // 데이터베이스 정보를 넣으면 됌.
  // createUserDto.user.id = req.body.user_id (타입은 컨트롤러에서 명시하였음)
  // 즉 DB안에 user_id와 req요청이 들어온 user_id가 일치하는것을 찾는 과정
  async create(createUserDto): Promise<any> {
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
    createUserDto.user_password = await hash(
      createUserDto.user_password,
      bcryptConstant.saltOrRounds
    );
    const { user_password, ...result } = await this.usersRepository.save(
      createUserDto
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
  }
}
