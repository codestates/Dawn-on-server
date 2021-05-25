import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users.entity';
import { JwtStrategy } from 'src/guards/jwt.strategy';
import { LocalStrategy } from 'src/guards/local.strategy';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from '../contants';
import { TokenService } from './token.service';
import { RefreshToken } from 'src/entities/RefreshToken.entity';
import { GoogleStrategy } from 'src/guards/google.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '500s' },
    }),
    TypeOrmModule.forFeature([Users]),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    TokenService,
    GoogleStrategy,
  ],
  controllers: [AuthController],
  exports: [TokenService, AuthService, GoogleStrategy],
})
export class AuthModule {}
