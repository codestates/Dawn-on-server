import { Injectable, Req, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenService } from "src/auth/token.service";
import { CreateUserDto } from "src/dtos/create-user.dto";
import { UsersService } from "src/users/users.service";
import { config } from "dotenv";
import { Users } from "src/entities/Users.entity";
config();
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    });
    this.tokenService = tokenService;
    this.usersService = usersService;
  }
  async validate(payload: any) {
    // const accessTokenIat = this.tokenService.resolveAccessToken(
    //   payload.accessToken,
    // );

    // if (accessTokenIat === null) {
    //   throw new UnauthorizedException("유효하지 않은 토큰입니다.");
    // }

    const { user_id }: any = payload;
    const user: Users = await this.usersService.findOne(user_id);

    if (!user) {
      throw new UnauthorizedException("유효하지 않은 요청입니다.");
    }

    delete user.user_password;
    return user;
  }
}
