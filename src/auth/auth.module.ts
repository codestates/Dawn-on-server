import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '500s' },
    }),
    TypeOrmModule.forFeature([Users]),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, TokenService],
  controllers: [AuthController],
  exports: [TokenService],
})
export class AuthModule {}
