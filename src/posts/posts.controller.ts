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
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { PostingAuthGuard } from "src/guards/posting-auth.guard";
import { UsersService } from "src/users/users.service";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
  constructor(
    private usersService: UsersService,
    private postsService: PostsService,
  ) {
    this.usersService = usersService;
    this.postsService = postsService;
  }

  // @UseGuards(PostingAuthGuard)
  @Post("posting")
  async posting(@Req() req) {
    // console.log(req);
    const newPost = await this.postsService.posting(
      req.body.user_id,
      req.body.postdatas,
    );

    return newPost;
  }

  @Post("search-user")
  async searchuser(@Body() body, @Res({ passthrough: true }) res) {
    const postings = await this.postsService.searchUser(body.user_id);
    return { user_id: body.user_id, postings: postings };
  }

  @Post("search-job")
  async searchJob(@Body() body, @Res({ passthrough: true }) res) {
    const postDatas = await this.postsService.searchJob(body.user_job);
    return {
      user_job: body.user_job,
      postDatas,
      message: "직업별 포스트 데이터 가져오기 완료",
    };
  }

  @Post("search-tag")
  async searchTag(@Body() body, @Res({ passthrough: true }) res) {
    const tagDatas = await this.postsService.searchTagPostId(body.tag);

    const tagNumbers = await this.postsService.searchTagPostIdNumber(tagDatas);

    const postDatas = await this.postsService.searchTag(tagNumbers);

    // console.log(postDatas[0].posts.id);
    return { user_tag: body.tag, postDatas };
  }

  @Get("mainfeed")
  async mainfeed(@Res({ passthrough: true }) res) {
    const postDatas = await this.postsService.searchAll();

    // console.log(postDatas[0].posts.id);
    return { postDatas };
  }
}
