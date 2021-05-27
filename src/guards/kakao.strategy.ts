import { PassportStrategy } from "@nestjs/passport";
// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from "passport-kakao";
import { config } from "dotenv";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from "src/auth/auth.service";

config();

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: "",
      callbackURL: `${process.env.CALLBACK_URI}/auth/kakao/redirect`,
    });
    this.authService = authService;
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { nickname, profileImageURL } = profile._json.kakao_account.profile;
    console.log(profile._json.kakao_account.profile);
    console.log(accessToken);
    const users = {
      user_id: profile._json.kakao_account.email,
      user_nickname: nickname,
      user_job: "전체",
      user_img: profileImageURL,
      accessToken,
      refreshToken,
    };

    const { user } = await this.authService.validateOAuthLogin(users, "kakao");

    done(null, { user });
  }
}
