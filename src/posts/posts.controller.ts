import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { CreateDataDto } from "src/dtos/create-data.dto";
import { Posts } from "src/entities/Posts.entity";
import { PostingAuthGuard } from "src/guards/posting-auth.guard";
import { UsersService } from "src/users/users.service";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
  constructor(
    private usersService: UsersService,
    private postsService: PostsService
  ) {
    this.usersService = usersService;
    this.postsService = postsService;
  }
  @UseGuards(PostingAuthGuard)
  @Post("posting")
  async posting(@Req() req) {
    const newPost = await this.postsService.posting(
      req.postData.user_id,
      req.postData.postdatas
    );

    return newPost;
  }

  @Get("searchuser")
  async searchuser(@Body() body, @Res({ passthrough: true }) res) {
    const postings = await this.postsService.searchUser(body.user_id);
    return { user_id: body.user_id, postings: postings };
  }

  @Get("searchall")
  async searchall(@Body() body, @Res({ passthrough: true }) res) {
    const postingAll = await this.postsService.searchAll(body.user_job);
    return { user_job: body.user_job, postingAll: postingAll };
  }
}
