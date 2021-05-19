import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Users } from "./Users.entity";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @OneToOne(() => Users, (user) => user.refreshToken, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: Users;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
