import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Posts } from "src/entities/Posts.entity";
import { RefreshToken } from "src/entities/RefreshToken.entity";
import { Stars } from "src/entities/Star_collections.entity";
import { Tags } from "src/entities/Tags.entity";
import { Todos } from "src/entities/Todos.entity";
import { Users } from "src/entities/Users.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Posts, Stars, RefreshToken, Todos, Tags]),
    ConfigModule.forRoot({ envFilePath: ".env" }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
