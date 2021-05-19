import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { LocalAuthGuard } from "src/guards/local-auth.guard";
import { AuthService } from "./auth.service";
/* import { GoogleAuthGuard } from "src/guards/google-auth.guard";
import { KakaoAuthGuard } from "src/guards/kakao-auth.guard"; */

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("signin")
  async login(@Req() req) {
    return this.authService.login(req.user);
  }
  //   @Post('login')
  //   async login(@Req() req) {
  //     // const datas = this.authService.validateUser(req.body);
  //     // console.log(datas);
  //     return this.authService.validateUser(req.body);
  //   }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Req() req) {
    return req.user;
  }

  /*   @UseGuards(GoogleAuthGuard)
  @Get("google")
  async googleSignin(@Req() req) {}

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleSigninCallback(@Req() req) {
    return this.authService.googleSignin(req);
  }

  @UseGuards(KakaoAuthGuard)
  @Get("kakao")
  kakaoSignin(@Req() req) {} */
}
