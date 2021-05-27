import { CreateDataDto } from "src/dtos/create-data.dto";
import { CreateUserDto } from "src/dtos/create-user.dto";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Posts } from "./Posts.entity";
import { Users } from "./Users.entity";
@Entity()
export class Todos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  learning_time: number;

  @Column({ default: "#FFFFFF" })
  box_color: string;

  @Column()
  todo_comment: string;

  @Column({ default: null })
  subject: number | null;

  @ManyToOne((type) => Posts, (posts) => posts.todos)
  posts!: number;
}
