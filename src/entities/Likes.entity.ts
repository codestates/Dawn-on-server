import { Post } from "@nestjs/common";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Posts } from "./Posts.entity";
import { Users } from "./Users.entity";
@Entity()
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Posts, (posts) => posts.likes)
  posts: number;

  @ManyToOne((type) => Users, (users) => users.likes)
  users: number;
}
