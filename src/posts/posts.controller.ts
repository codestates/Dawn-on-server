import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { TokenService } from "src/auth/token.service";
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
    private tokenService: TokenService
  ) {
    this.usersService = usersService;
    this.postsService = postsService;
    this.tokenService = tokenService;
  }

  // @UseGuards(PostingAuthGuard)
  @Post("posting")
  async posting(@Req() req, @Res({ passthrough: true }) res) {
    const decoded = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      res.status(401).send("접근 권한이 없습니다.");
    } else {
      const newPost = await this.postsService.posting(
        decoded.user.user_nickname,
        req.body.postdatas
      );

      if (newPost !== undefined) {
        res.status(200).send({ message: "포스팅 요청 성공" });
      } else {
        res.status(400).send({ message: "올바르지 않은 요청입니다." });
      }
    }
    // console.log(req);
  }

  @Post("search-user")
  async searchuser(@Body() body, @Res({ passthrough: true }) res) {
    const postDatas = await this.postsService.searchUser(body.user_nickname);

    if (postDatas !== undefined) {
      res.status(200).send({
        user_nickname: body.user_nickname,
        postings: postDatas,
        message: "닉네임별 포스트 데이터 가져오기 완료",
      });
    } else {
      res.status(400).send({ message: "올바르지 않은 요청입니다." });
    }
  }

  @Post("search-job")
  async searchJob(@Body() body, @Res({ passthrough: true }) res) {
    const postDatas = await this.postsService.searchJob(body.user_job);

    if (postDatas !== undefined) {
      res.status(200).send({
        user_job: body.user_job,
        postDatas,
        message: "직업별 포스트 데이터 가져오기 완료",
      });
    } else {
      res.status(400).send({ message: "올바르지 않은 요청입니다." });
    }
  }

  @Post("search-tag")
  async searchTag(@Body() body, @Res({ passthrough: true }) res) {
    const tagDatas = await this.postsService.searchTagPostId(body.tag);

    const tagNumbers = await this.postsService.searchTagPostIdNumber(tagDatas);

    const postDatas = await this.postsService.searchTag(tagNumbers);

    // console.log(postDatas[0].posts.id);

    if (postDatas !== undefined) {
      res.status(200).send({
        user_tag: body.tag,
        postDatas,
        message: "태그별 포스트 데이터 가져오기 완료.",
      });
    } else {
      res.status(400).send({ message: "올바르지 않은 요청입니다." });
    }
  }

  @Get("mainfeed")
  async mainfeed(@Req() req, @Res({ passthrough: true }) res) {
    const decoded = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      res.status(401).send("접근 권한이 없습니다.");
    } else {
      const postDatas = await this.postsService.searchAll();

      const ranking = await this.postsService.searchRank();

      // console.log(postDatas[0].posts.id);
      if (postDatas !== undefined && ranking !== undefined) {
        res.status(200).send({
          postDatas,
          ranking: ranking,
          message: "전체 포스트 및 랭킹순 포스트 가져오기 완료",
        });
      } else {
        res.status(400).send({ message: "올바르지 않은 요청입니다." });
      }
    }
  }

  @Post("change-thumbsup")
  async change_thumbsup(@Req() req, @Res({ passthrough: true }) res) {
    const decoded = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      res.status(401).send("접근 권한이 없습니다.");
    } else {
      const postDatas = await this.postsService.changeThumbsUp(
        decoded.user.id,
        req.body.post_PK
      );

      console.log(postDatas);
      res.status(200).send({ thumbs_up: postDatas });
    }
  }

  @Post("searchThumbsUp")
  async searchThumbsUp(@Req() req, @Res({ passthrough: true }) res) {
    const decoded = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      res.status(401).send("접근 권한이 없습니다.");
    } else {
      const searchDatas = await this.postsService.searchThumbsUp(
        decoded.user.id,
        req.body.post_PK
      );
      if (searchDatas === undefined) {
        res.status(400).send("유효하지 않은 입력입니다.");
      } else {
        res.status(200).send(searchDatas);
      }
    }
  }

  @Get("myfeed")
  async getPost(@Req() req, @Res({ passthrough: true }) res) {
    const decoded = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      res.status(401).send("접근 권한이 없습니다.");
    } else {
      const getPostingData = await this.postsService.getPost(decoded.user.id);

      if (getPostingData === false) {
        res.status(404).send("유효한 유저가 아닙니다.");
        return;
      }
      if (getPostingData.length === 0) {
        res.status(400).send("포스팅 가져오기 실패: 작성된 포스팅이 없습니다.");
      } else {
        res.status(200).send({
          message: "포스팅 가져오기 성공",
          userDatas: getPostingData.userdata,
          postDatas: getPostingData.postdata,
        });
      }
    }
  }

  // 컨트롤러 내에서 accessToken 복호화
  @Delete("myfeed")
  async deletePost(@Req() req, @Res({ passthrough: true }) res) {
    const decoded = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      res.status(401).send("접근 권한이 없습니다.");
    } else {
      // console.log(decoded);
      const deletePostingData = await this.postsService.deletePost(
        req.body.post_PK,
        decoded.user.id
      );
      console.log(deletePostingData);
      if (deletePostingData === true) {
        res.status(200).send("포스팅 삭제 성공");
      } else {
        res.status(400).send("포스팅 삭제 실패");
      }
    }
  }

  @Patch("myfeed")
  async patchPost(@Req() req, @Res({ passthrough: true }) res) {
    const decoded = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      res.status(401).send("접근 권한이 없습니다.");
    } else {
      const patchPostingData = await this.postsService.pacthPost(
        decoded.user.id,
        req.body.postdatas
      );
      console.log(patchPostingData);
      if (patchPostingData === true) {
        res.status(200).send("포스팅 업데이트 성공");
      } else {
        res.status(400).send("포스팅 업데이트 실패");
      }
    }
  }

  // @Post('ranking')
  // async change_thumbsup(@Body() body, @Res({ passthrough: true }) res) {
  //   const postDatas = await this.postsService.changeThumbsUp(
  //     body.user_PK,
  //     body.post_PK,
  //   );

  //   console.log(postDatas);
  //   res.status(200).send({ thumbs_up: postDatas });
  // }
}
