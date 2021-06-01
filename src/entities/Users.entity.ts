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
import { Likes } from "./Likes.entity";
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
  total_learning_time: number;

  @Column({ default: 0 })
  total_posting: number;

  @Column({ default: 0 })
  total_star: number;

  @Column({ default: 0 })
  total_thumbsup: number | null;

  @Column({ default: null })
  user_img: string | null;

  @Column({ default: null })
  user_job: string | null;

  @Column({ default: null })
  profile_comment: string;

  @Column({ default: "local" })
  provider: string;
  // user.provider = 'local'
  // user.provider = provider

  @Column({ default: null })
  scrap_planer: string | null;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;

  @OneToMany((type) => Posts, (posts) => posts.users, { cascade: true })
  posts!: number[];

  @OneToMany((type) => Stars, (stars) => stars.users, { cascade: true })
  stars!: number[];

  @OneToMany((type) => Likes, (likes) => likes.users, { cascade: true })
  likes!: number[];
}
