import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
import { Users } from "../entities/Users.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { getConnection, Repository } from "typeorm";
import { bcryptConstant } from "../contants";
import { hash } from "bcrypt";
import { config } from "dotenv";

config();

const salt = process.env.SALTORROUNDS;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>
  ) {}
  //   private users: Users[] = []; // 데이터베이스 정보를 넣으면 됌.

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
      Number(salt)
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

  findId(id: number): Promise<Users> {
    return this.usersRepository.findOne({ id: id });
  }

  async update(req): Promise<void> {
    const { user_id, user_nickname, user_img, user_job, user_password } =
      req.body;
    const newUsers = await this.usersRepository.findOne({
      user_id: user_id,
    });
    newUsers.user_nickname = user_nickname;
    newUsers.user_img = user_img;
    newUsers.user_job = user_job;
    newUsers.user_password = await hash(user_password, Number(salt));
    await this.usersRepository
      .save(newUsers)
      .then(() => "유저 정보가 수정되었습니다.");
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
