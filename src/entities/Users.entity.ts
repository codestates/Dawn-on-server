import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Posts } from './Posts.entity';
import { Stars } from './Star_collections.entity';
@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_name: string;

  @Column()
  user_nickname: string;

  @Column()
  user_password: string;

  @Column()
  user_id: string;

  @Column()
  user_img: string;

  @Column()
  user_job: string;

  @Column()
  profile_comment: string;

  @Column()
  scrap_planer: string;

  @OneToMany((type) => Posts, (posts) => posts.posts)
  users_post!: Users[];

  @OneToMany((type) => Stars, (stars) => stars.stars)
  users_star!: Users[];
}
