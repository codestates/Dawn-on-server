import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginUserDto } from "../dtos/login-user-dto";
import { Users } from "src/entities/Users.entity";
import { compare } from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private jwtService: JwtService
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.userRepository.findOne({
      user_id: loginUserDto.user_id,
    });

    if (!user) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: [`등록되지 않은 사용자입니다.`],
        error: `상태코드:${HttpStatus.FORBIDDEN}`,
      });
    }

    // 유저정보 확인
    const isMatch = await compare(
      loginUserDto.user_password,
      user.user_password
    );

    if (isMatch) {
      const { user_password, ...result } = user;
      return result;
    } else {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: [`사용자 정보가 일치하지 않습니다.`],
        error: `상태코드:${HttpStatus.FORBIDDEN}`,
      });
    }
  }
  async signin(user: any) {
    const payload = {
      user_id: user.user_id,
      user_password: user.user_password,
      user_nickname: user.user_nickname,
      user_job: user.user_job,
      user_name: user.user_name,
      user_img: user.user_img,
      profile_comment: user.profile_comment,
      scrap_planer: user.scrap_planer,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
