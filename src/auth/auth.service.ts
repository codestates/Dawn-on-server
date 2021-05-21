import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users.entity';
import { Repository } from 'typeorm';
import { CreateLoginDto } from '../dtos/create-login.dto';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { TokenService } from './token.service';
import { RefreshToken } from 'src/entities/RefreshToken.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private jwtService: JwtService,
    private usersService: UsersService,

    @InjectRepository(RefreshToken)
    private tokenService: TokenService,
  ) {
    this.usersRepository = usersRepository;
    this.jwtService = jwtService;
    this.usersService = usersService;
  }

  async validateUser(user_id: string, user_password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      user_id: user_id,
    });
    //console.log(user);
    if (!user) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: [`등록되지 않은 사용자입니다.`],
        error: 'Forbidden',
      });
    }
    //  console.log(user_password);
    //   console.log(user.user_password);
    let isMatch: boolean;
    if (await compare(user_password, user.user_password)) {
      console.log('true');
      isMatch = true;
    } else {
      // console.log("false");
      isMatch = false;
    }

    if (isMatch) {
      const { user_password, ...result } = user;
      return result;
    } else {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: [`사용자 정보가 일치하지 않습니다.`],
        error: 'Forbidden',
      });
    }
  }

  /*   async login(user: any) {
    const payload = {
      user_id: user.user_id,
      //   user_password: user.user_password,
      user_nickname: user.user_nickname,
      user_job: user.user_job,
      user_name: user.user_name,
      user_img: user.user_img,
      profile_comment: user.profile_comment,
      scrap_planer: user.scrap_planer,
    };
    // console.log(payload);
    return {
      accessToken: this.jwtService.sign(payload),
    };
  } */

  async validateOAuthLogin(userProfile: any, provider: string): Promise<any> {
    const { user_id, profileUrl, user_job, user_nickname } = userProfile;
    let user = await this.usersService.findOne(`${user_id}[AUTH]`);

    if (!user) {
      const newUser = new Users();
      newUser.user_id = `${user_id}[AUTH]`;
      newUser.user_password = await hash(Math.random().toString(36), 10);
      newUser.user_nickname = user_nickname; // 초기 닉네임은 사용자 이름
      newUser.user_job = user_job;
      newUser.user_img = profileUrl;
      if (provider) {
        newUser.provider = provider;
      } else {
        newUser.provider = null;
      }
      user = await this.usersService.create(newUser);
    }
    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(user);
    return { user, tokens: { accessToken, refreshToken } };
  }
}
