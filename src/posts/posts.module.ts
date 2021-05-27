import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { jwtConstants } from "src/contants";
import { Posts } from "src/entities/Posts.entity";
import { Stars } from "src/entities/Star_collections.entity";
import { Tags } from "src/entities/Tags.entity";
import { Todos } from "src/entities/Todos.entity";
import { Users } from "src/entities/Users.entity";
import { StarsService } from "src/stars/stars.service";
import { UsersModule } from "src/users/users.module";
import { UsersService } from "src/users/users.service";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env" }),
    UsersModule,
    // JwtModule.register({
    //   secret: jwtConstants.secret,
    //   signOptions: { expiresIn: '500s' },
    // }),
    TypeOrmModule.forFeature([Users, Posts, Stars, Todos, Tags]),
  ],
  controllers: [PostsController],
  providers: [PostsService, StarsService, UsersService],
})
export class PostsModule {}
