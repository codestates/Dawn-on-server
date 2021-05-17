import { Module } from "@nestjs/common";
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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "gksrnr12",
      database: "dawnon",
      entities: [Users, Posts, Stars], // 사용할 entity의 클래스명을 넣어둔다.
      synchronize: true,
      autoLoadEntities: true, // false가 안전.
    }),
    UsersModule,
    PostsModule,
    StarsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
