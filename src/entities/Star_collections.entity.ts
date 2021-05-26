import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Users } from "./Users.entity";
@Entity()
export class Stars {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  path: string;

  @ManyToOne((type) => Users, (users) => users.stars)
  users!: Users;
}
