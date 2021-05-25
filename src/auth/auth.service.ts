import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "src/entities/Users.entity";
import { Repository } from "typeorm";
import { CreateLoginDto } from "../dtos/create-login.dto";
import { compare, hash } from "bcrypt";
import { CreateUserDto } from "src/dtos/create-user.dto";
import { UsersService } from "src/users/users.service";
import { TokenService } from "./token.service";
import { RefreshToken } from "src/entities/RefreshToken.entity";
import axios from "axios";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private jwtService: JwtService,
    private usersService: UsersService,

    @InjectRepository(RefreshToken)
    private tokenService: TokenService
  ) {
    this.usersRepository = usersRepository;
    this.jwtService = jwtService;
    this.usersService = usersService;
    this.tokenService = tokenService;
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
        error: "Forbidden",
      });
    }
    //  console.log(user_password);
    //   console.log(user.user_password);
    let isMatch: boolean;
    if (await compare(user_password, user.user_password)) {
      console.log("true");
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
        error: "Forbidden",
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

  async googleLogin(bodyData, res) {
    if (bodyData.authorizationCode) {
      await axios
        .post("https://accounts.google.com/o/oauth2/token", {
          client_id:
            "857821217387-1mg60omjr6uok183k4vrh5begv613glj.apps.googleusercontent.com",
          client_secret: "CD9hais_Oz92DYrhu2bTRTNa",
          code: bodyData.authorizationCode,
          redirect_uri: "http://localhost:3000/explore",
          grant_type: "authorization_code",
        })
        .then((response) => {
          console.log(response);
          this.getGoogleInfo(
            response.data.access_token,
            response.data.token_type
          );
          /*     res.cookie({
            //domain: "ibingo.link",
            path: "/",
            //httpOnly: true,
            //secure: true,
            sameSite: "none",
          }); */
          res.status(200).send({ accessToken: response.data.access_token });
        })
        .catch(() => res.status(403).send("No permission"));
    } else {
      res.status(404).send("Not Found Google authorizationCode");
    }
  }

  // 구글에서 정보 받아오기
  getGoogleInfo = async (accessToken: string, token_type: string) => {
    await axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(async (res) => {
        console.log(res);
        let user: Users = await this.usersRepository.findOne({
          user_id: res.data.name,
        });

        if (!user) {
          const newUser = new Users();
          newUser.user_id = res.data.name; //`${res.data.profileObj.email}[AUTH]`;
          newUser.user_password = await hash(Math.random().toString(36), 10);
          newUser.user_nickname = res.data.name;
          newUser.user_job = "전체"; //res.data.profileObj.name; // 초기 닉네임은 사용자 이름
          newUser.user_img = res.data.picture; //res.data.profileObj.imgUrl;
          if (token_type) {
            newUser.provider = "social";
          } else {
            newUser.provider = null;
          }
          user = await this.usersService.create(newUser);
        } else {
          const accessToken = await this.tokenService.generateAccessToken(user);
          const refreshToken = await this.tokenService.generateRefreshToken(
            user
          );
          return { user, tokens: { accessToken, refreshToken } };
        }
      });
  };
}
