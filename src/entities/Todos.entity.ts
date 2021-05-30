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
export class Todos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  learning_time: number;

  @Column({ default: "#FFFFFF" })
  box_color: string;

  @Column()
  todo_comment: string;

  @Column()
  subject: string;
  //상단에 쓰는 본인 글

  @Column()
  start_time: string;
  //상단에 쓰는 본인 글

  @ManyToOne((type) => Posts, (posts) => posts.todos, { onDelete: "CASCADE" })
  posts!: number;
}
