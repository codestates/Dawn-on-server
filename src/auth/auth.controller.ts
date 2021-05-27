import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { GoogleAuthGuard } from 'src/guards/google-auth.guard';
import { KakaoAuthGuard } from 'src/guards/kakao-auth.guard';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { KakaoStrategy } from 'src/guards/kakao.strategy';

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {
    this.authService = authService;
    this.usersService = usersService;
    this.tokenService = tokenService;
  }

  @UseGuards(KakaoAuthGuard)
  @Get('kakao')
  async kakaoLogin(@Req() req) {}

  @UseGuards(KakaoAuthGuard)
  @Get('kakao/redirect')
  async kakaoLoginRedirect(
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<any> {
    const { user } = req;
    // console.log(req.headers);

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      // domain: 'localhost:3000',
      path: '/',
      // secure: true,
      httpOnly: true,
      // sameSite: 'None',
    });
    res.cookie('accessToken', accessToken, {
      maxAge: 1000 * 60 * 60 * 2, // 15분 간유지
      path: '/',
      httpOnly: true,
    });

    // // 메인화면 구성에 따라서 수정.

    return res.redirect(`http://localhost:3000/explore`);
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
  async signIn(@Req() req, @Res({ passthrough: true }) res): Promise<any> {
    const { user } = req;
    console.log(req.headers);

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      // domain: 'localhost:3000',
      path: "/",
      // secure: true,
      httpOnly: true,
      // sameSite: 'None',
    });
    res.cookie('accessToken', accessToken, {
      maxAge: 1000 * 60 * 60 * 2, // 15분 간유지
      path: '/',
      httpOnly: true,
    });

    return {
      data: { accessToken },
      message: "로그인이 성공적으로 되었습니다.",
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('mypage')
  async getProfile(@Req() req): Promise<any> {
    const user = req.user;

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post("signout")
  async signOut(@Req() req, @Res({ passthrough: true }) res): Promise<string> {
    const { user } = req;
    res.clearCookie("refreshToken");
    await this.tokenService.deleteRefreshTokenFromUser(user);

    return "로그아웃 되었습니다.";
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() req) {}

  @Get("google/redirect")
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(
    @Req() req,
    @Res({ passthrough: true }) res
  ): Promise<any> {
    const { user } = req;
    // console.log(req.headers);

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      // domain: 'localhost:3000',
      path: '/',
      // secure: true,
      httpOnly: true,
      // sameSite: 'None',
    });
    res.cookie('accessToken', accessToken, {
      maxAge: 1000 * 60 * 60 * 2, // 15분 간유지
      path: '/',
      httpOnly: true,
    });

    // // 메인화면 구성에 따라서 수정.

    return res.redirect(`http://localhost:3000/explore`);

    // return {
    //   data: { accessToken },
    //   message: '로그인이 성공적으로 되었습니다.',
    // };
  }

  // @Get('auth/')
}
