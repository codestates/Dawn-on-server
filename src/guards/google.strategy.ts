import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private authService: AuthService) {
    super({
      clientID: `857821217387-1mg60omjr6uok183k4vrh5begv613glj.apps.googleusercontent.com`,
      clientSecret: `process.env.GOOGLE_SECRET`,
      callbackURL: "http://localhost:3000/auth/google/callback",
      scope: ["profile", "email"],
    });
  }

  //   async validate(
  //     accessToken: string,
  //     refreshToken: string,
  //     profile: any,
  //   ): Promise<any> {
  //     const { emails } = profile;
  //     const user = {
  //       user_id: emails[0].value,
  //       accessToken,
  //       refreshToken,
  //     };
  //     done(null, user);
  //   }

  async validate(
    accessToken: string,
    // refreshToken: string,
    profile: any
  ): Promise<any> {
    console.log("토큰 확인됨");
    const { email, imageUrl, name } = profile;
    const userProfile = {
      user_id: email,
      accessToken,
      // refreshToken,
      user_nickname: name,
      profileUrl: imageUrl,
      user_job: "전체",
    };
    const { user, tokens } = await this.authService.validateOAuthLogin(
      userProfile,
      "google"
    );
    return { user, tokens };
  }
}
