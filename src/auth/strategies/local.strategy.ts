import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { LoginUserDto } from "../../dtos/login-user-dto";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: "user_id",
    });
  }

  async validate(user_id: string, user_password: string): Promise<any> {
    let loginUserDto: LoginUserDto = {
      user_id: user_id,
      user_password: user_password,
    };

    const user = await this.authService.validateUser(loginUserDto);
    if (!user) {
      throw new UnauthorizedException("유효하지 않은 유저입니다.");
    }
    return user;
  }
}
