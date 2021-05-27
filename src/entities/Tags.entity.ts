import { Post } from "@nestjs/common";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Posts } from "./Posts.entity";
@Entity()
export class Tags {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: null })
  tag: string | null;

  @ManyToOne((type) => Posts, (posts) => posts.tags)
  posts!: number;
}
