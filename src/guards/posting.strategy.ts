import { Body, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenService } from "src/auth/token.service";
import { CreateUserDto } from "src/dtos/create-user.dto";
import { UsersService } from "src/users/users.service";
@Injectable()
export class PostingStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    });
    this.tokenService = tokenService;
  }
  async validate(payload: any, @Body() body): Promise<any> {
    const accessTokenData = this.tokenService.resolveAccessToken(
      payload.accessToken
    );

    if (accessTokenData === null) {
      throw new UnauthorizedException("로그인이 필요합니다.");
    }

    return { accessTokenData: accessTokenData, postData: body.postdatas };
  }
}
