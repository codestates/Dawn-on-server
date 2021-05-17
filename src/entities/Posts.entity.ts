import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Users } from './Users.entity';
@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  datas: string;

  @ManyToOne((type) => Users, (users) => users.users_post)
  posts!: Posts;
}
