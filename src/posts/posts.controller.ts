import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CreateDataDto } from 'src/dtos/create-data.dto';
import { Posts } from 'src/entities/Posts.entity';
import { UsersService } from 'src/users/users.service';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private usersService: UsersService,
    private postsService: PostsService,
  ) {
    this.usersService = usersService;
    this.postsService = postsService;
  }

  @Post('posting')
  async posting(@Body() body) {
    const newPost = await this.postsService.posting(
      body.user_id,
      body.postdatas,
    );

    return newPost;
  }

  @Get('searchuser')
  async searchuser(@Body() body, @Res({ passthrough: true }) res) {
    const postings = await this.postsService.searchUser(body.user_id);
    return { user_id: body.user_id, postings: postings };
  }

  @Get('searchall')
  async searchall(@Body() body, @Res({ passthrough: true }) res) {
    const postingAll = await this.postsService.searchAll(body.user_job);
    return { user_job: body.user_job, postingAll: postingAll };
  }
}
