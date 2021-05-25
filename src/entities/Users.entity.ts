import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Posts } from './Posts.entity';
import { Stars } from './Star_collections.entity';
import { RefreshToken } from './RefreshToken.entity';
@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_nickname: string;

  @Column()
  user_password: string;

  @Column()
  user_id: string;

  @Column({ default: null })
  user_img: string | null;

  @Column()
  user_job: string;

  @Column({ default: null })
  profile_comment: string;

  @Column({ default: null })
  provider: string | null;
  // user.provider = 'local'
  // user.provider = provider

  @Column({ default: null })
  scrap_planer: string | null;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;

  @OneToMany((type) => Posts, (posts) => posts.users)
  posts!: number[];

  @OneToMany((type) => Stars, (stars) => stars.users)
  stars!: number[];
}
