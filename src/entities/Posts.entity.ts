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
import { Users } from "./Users.entity";
import { Todos } from "./Todos.entity";
@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  tag: string;

  @Column()
  sticker: string;

  @Column()
  memo: string;

  @Column()
  back_color: string;

  @Column()
  today_learning_time: number;

  @Column()
  comment: string;

  @Column({ default: null })
  thumbs_up: number | null;

  @ManyToOne((type) => Users, (users) => users.posts)
  users!: number;

  @OneToMany((type) => Todos, (todos) => todos.posts)
  todos!: number[];
}
