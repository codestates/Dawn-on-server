import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

const jwtConstants = {
  secret: "secretKey",
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return {
      user_id: payload.user_id,
      user_password: payload.user_password,
      user_nickname: payload.user_nickname,
      user_job: payload.user_job,
      user_name: payload.user_name,
      user_img: payload.user_img,
      profile_comment: payload.profile_comment,
      scrap_planer: payload.scrap_planer,
    };
  }
}
