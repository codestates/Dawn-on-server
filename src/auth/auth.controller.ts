import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local_auth.guard";
import { JwtAuthGuard } from "./guards/jwt_auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("signin")
  async signin(@Req() req) {
    return this.authService.signin(req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Get("mypage")
  getProfile(@Req() req) {
    return req.user;
  }
}
