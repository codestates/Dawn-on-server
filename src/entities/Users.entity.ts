import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Posts } from "./Posts.entity";
import { Stars } from "./Star_collections.entity";
import { RefreshToken } from "./RefreshToken.entity";
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

  @Column({ default: 0 })
  total_learning_time: number | 0;

  @Column({ default: 0 })
  total_posting: number | 0;

  @Column({ default: 0 })
  total_star: number | 0;

  @Column({ default: null })
  user_img: string | null;

  @Column({ default: null })
  user_job: string | null;

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
