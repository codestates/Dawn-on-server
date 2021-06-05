import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { LocalAuthGuard } from "src/guards/local-auth.guard";
import { GoogleAuthGuard } from "src/guards/google-auth.guard";
import { KakaoAuthGuard } from "src/guards/kakao-auth.guard";
import { UsersService } from "src/users/users.service";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";
import { InjectRepository } from "@nestjs/typeorm";
import { KakaoStrategy } from "src/guards/kakao.strategy";
import { CreateUserDto } from "src/dtos/create-user.dto";
import { config } from "dotenv";
import { Users } from "src/entities/Users.entity";
import { Repository } from "typeorm";

config();

@Controller("auth")
export class AuthController {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private authService: AuthService,
    private usersService: UsersService,
    private tokenService: TokenService
  ) {
    this.authService = authService;
    this.usersService = usersService;
    this.tokenService = tokenService;
    this.usersRepository = usersRepository;
  }

  @Post("signup")
  async create(@Body() createUserDto: any, @Res() res): Promise<any> {
    const createUser: Users = await this.usersService.create(
      createUserDto.userdto
    );
    res.status(200).send({ createUser, message: "회원가입 성공" });
  }

  @UseGuards(KakaoAuthGuard)
  @Get("kakao")
  async kakaoLogin(@Req() req): Promise<void> {}

  @UseGuards(KakaoAuthGuard)
  @Get("kakao/redirect")
  async kakaoLoginRedirect(@Req() req, @Res() res): Promise<any> {
    const { user }: any = req;
    // console.log(req.headers);

    const accessToken: string = await this.tokenService.generateAccessToken(
      user
    );
    const refreshToken: string = await this.tokenService.generateRefreshToken(
      user
    );

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일간 유지
      domain: "dawn-on.club",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "None",
    });
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 2, // 2시간 유지
      domain: "dawn-on.club",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "None",
    });

    // // 메인화면 구성에 따라서 수정.
    return res.redirect(`${process.env.REDIRECT_URI}/explore`);
  }
  // @UseGuards(LocalAuthGuard)
  // @Post('signin')
  // async login(@Req() req) {
  //   return this.authService.login(req.user);
  // }
  //   @Post('login')
  //   async login(@Req() req) {
  //     // const datas = this.authService.validateUser(req.body);
  //     // console.log(datas);
  //     return this.authService.validateUser(req.body);
  //   }

  @UseGuards(LocalAuthGuard)
  @Post("signin")
  async signIn(@Req() req, @Res() res): Promise<void> {
    const { user }: any = req;
    // console.log(req.headers);

    const accessToken: string = await this.tokenService.generateAccessToken(
      user
    );
    const refreshToken: string = await this.tokenService.generateRefreshToken(
      user
    );

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7, //7일간 유지
      domain: "dawn-on.club",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "None",
    });
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 2, // 2시간 유지
      domain: "dawn-on.club",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "None",
    });

    res.status(200).send({
      user_id: user.user_id,
      message: "로그인이 성공적으로 되었습니다.",
    });
  }

  // @UseGuards(JwtAuthGuard)
  @Get("mypage")
  async getProfile(@Req() req, @Res() res): Promise<void> {
    let decoded: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );

    let userDatas = await this.usersRepository.findOne({ id: decoded.id });
    // console.log(userDatas)
    if (decoded === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );
      //console.log("refresh", refresh);
      if (refresh === null) {
        return res.status(401).send("접근 권한이 없습니다.");
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        decoded = await this.tokenService.resolveAccessToken(accessToken);

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }
    const user: Users = userDatas;
    res.status(200).send({ user, message: "개인정보 가져오기 완료" });
  }

  // @UseGuards(JwtAuthGuard)
  @Patch("mypage")
  async patchProfile(@Req() req, @Res() res): Promise<any> {
    let decoded: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );
      //console.log("refresh", refresh);
      if (refresh === null) {
        return res.status(401).send("접근 권한이 없습니다.");
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        decoded = await this.tokenService.resolveAccessToken(accessToken);

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간 유지
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }

    const user_PK: Users = await this.usersRepository.findOne({
      id: decoded.user.id,
    });

    // console.log("user_pk:", user_PK);

    const updateUser: any = await this.usersService.update(user_PK.id, req);
    if (updateUser === false) {
      res.status(400).send("중복된 닉네임 입니다.");
    } else {
      /*     const accessToken: string = await this.tokenService.generateAccessToken(
        user_PK
      );
             res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 15분 간유지
          //domain: "dawn-on.club",
          path: "/",
          // secure: true,
          httpOnly: true,
          //sameSite: "None",
        }); */
      res.status(200).send({ updateUser, message: "유저 정보 업데이트 완료" });
    }
  }

  @Post("signout")
  async signOut(@Req() req, @Res() res): Promise<any> {
    let decoded: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );
      // console.log("refresh", refresh);
      if (refresh === null) {
        return res.status(401).send("접근 권한이 없습니다.");
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        decoded = await this.tokenService.resolveAccessToken(accessToken);

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간 유지
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }
    const { user }: any = decoded;
    res.clearCookie("refreshToken" /* { domain: "dawn-on.club" } */);
    res.clearCookie("accessToken" /* { domain: "dawn-on.club" } */);
    await this.tokenService.deleteRefreshTokenFromUser(user);

    res.status(200).send("로그아웃 성공");
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() req): Promise<void> {}

  @Get("google/redirect")
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req, @Res() res): Promise<any> {
    const { user }: any = req;
    // console.log(req.headers);

    const accessToken: string = await this.tokenService.generateAccessToken(
      user
    );
    const refreshToken: string = await this.tokenService.generateRefreshToken(
      user
    );

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일간 유지
      domain: "dawn-on.club",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "None",
    });
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 2, // 2시간 유지
      domain: "dawn-on.club",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "None",
    });

    // // 메인화면 구성에 따라서 수정.
    return res.redirect(`${process.env.REDIRECT_URI}/explore`);

    // return {
    //   data: { accessToken },
    //   message: '로그인이 성공적으로 되었습니다.',
    // };
  }

  @Get("signin/check")
  async checkUser(@Req() req, @Res() res): Promise<any> {
    let verify: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );

    if (verify === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );
      // console.log("refresh", refresh);
      if (refresh === null) {
        return res.status(401).send("접근 권한이 없습니다.");
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        // console.log("accsses", accessToken);
        verify = await this.tokenService.resolveAccessToken(accessToken);

        await res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간 유지
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }

    const findUserPK: Users = await this.usersRepository.findOne({
      user_id: verify.user.user_id,
    });

    return res.status(200).send({
      accessToken: req.cookies.accessToken,
      refreshToken: req.cookies.refreshToken,
      user_PK: findUserPK.id,
    });
  }
}
