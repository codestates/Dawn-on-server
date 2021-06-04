import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "src/auth/auth.service";
import { CreateLoginDto } from "../dtos/create-login.dto";
import { Strategy } from "passport-local";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "user_id", passwordField: "user_password" });
  }

  async validate(user_id: string, user_password: string): Promise<any> {
    const user: any = await this.authService.validateUser(
      user_id,
      user_password,
    );
    if (!user) {
      throw new UnauthorizedException("유효하지 않은 유저입니다.");
    }
    return user;
  }
}
