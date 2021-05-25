import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'http://localhost:4000/auth/google/redirect',
      scope: ['email', 'profile'],
    });
    this.authService = authService;
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { displayName, emails, photos, provider } = profile;
    // console.log(profile);
    const user = {
      user_id: emails[0].value,
      user_nickname: displayName,
      user_img: photos[0].value,
      accessToken,
      refreshToken,
    };

    done(null, { user });
  }
}

// const { user, tokens } = await this.authService.validateOAuthLogin(
//   users,
//   'google',
// );
