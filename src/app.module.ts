import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "./entities/Users.entity";
import { Posts } from "./entities/Posts.entity";
import { Stars } from "./entities/Star_collections.entity";

import { UsersModule } from "./users/users.module";
import { PostsModule } from "./posts/posts.module";
import { StarsModule } from "./stars/stars.module";
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";
import { AuthModule } from "./auth/auth.module";
import { RefreshToken } from "./entities/RefreshToken.entity";
import { TokenService } from "./auth/token.service";
import { GoogleStrategy } from "./guards/google.strategy";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DATABASE_HOST,
      port: 3306,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Users, Posts, Stars, RefreshToken], // 사용할 entity의 클래스명을 넣어둔다.
      synchronize: true,
      autoLoadEntities: true, // false가 안전.
      charset: "utf8mb4",
    }),
    UsersModule,
    PostsModule,
    StarsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
