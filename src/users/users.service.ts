import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
import { Users } from "../entities/Users.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { getConnection, Repository } from "typeorm";
import { compare, hash } from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>
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
    /*     const bcryptConstant = {
      saltOrRounds: 10,
    };

    // 위에 정의해둔 솔트값을 통해서 비밀번호 해싱
    createUserDto.user_password = await hash(
      createUserDto.user_password,
      bcryptConstant.saltOrRounds
    ); */

    // DB에 저장은 해두되, 리턴은 비밀번호 빼고
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
