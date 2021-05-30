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
import { Likes } from "./Likes.entity";
import { Tags } from "./Tags.entity";
import { Todos } from "./Todos.entity";
import { Users } from "./Users.entity";
@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  sticker: string;

  @Column()
  back_color: string;

  @Column()
  today_learning_time: number;

  @Column()
  d_day: number;

  @Column()
  comment: string;

  @Column()
  memo: string;
  //상단에 쓰는 본인 글

  @Column({ default: null })
  thumbs_up: number | null;

  @ManyToOne((type) => Users, (users) => users.posts, { onDelete: "CASCADE" })
  users!: number;

  @OneToMany((type) => Todos, (todos) => todos.posts, { cascade: true })
  todos!: number[];

  @OneToMany((type) => Tags, (tags) => tags.posts, { cascade: true })
  tags!: number[];

  @OneToMany((type) => Likes, (likes) => likes.posts, { cascade: true })
  likes!: number[];
}
