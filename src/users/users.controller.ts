import { Body, Controller, Get, Post } from "@nestjs/common";
import { userInfo } from "os";
import { Users } from "src/entities/Users.entity";
import { UsersService } from "src/users/users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post("signup")
  async saveUser(@Body() users: Users): Promise<string> {
    await this.usersService.signUp(users);

    return "회원가입 되었습니다.";
  }
}
