import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/Users.entity';
import { Posts } from './entities/Posts.entity';
import { Stars } from './entities/Star_collections.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'dawnon',
      entities: [Users, Posts, Stars], // 사용할 entity의 클래스명을 넣어둔다.
      synchronize: true,
      autoLoadEntities: false, // false가 안전.
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
