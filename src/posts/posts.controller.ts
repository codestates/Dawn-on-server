import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Next,
  NotFoundException,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { TokenService } from "src/auth/token.service";
import { CreateDataDto } from "src/dtos/create-data.dto";
import { Posts } from "src/entities/Posts.entity";
import { Tags } from "src/entities/Tags.entity";
import { Users } from "src/entities/Users.entity";
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
  async posting(@Req() req, @Res() res): Promise<any> {
    let decoded: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );

      if (refresh === null) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: `접근 권한이 없습니다.`,
          error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
        });
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        decoded = await this.tokenService.resolveAccessToken(accessToken);

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }
    //console.log(decoded);
    if (decoded === null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: `접근 권한이 없습니다.`,
        error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
      });
    } else {
      const newPost = await this.postsService.posting(
        decoded.user.id,
        req.body.postdatas
      );

      if (newPost !== undefined) {
        res.status(200).send({ message: "포스팅 요청 성공" });
      } else {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `올바르지 않은 요청입니다.`,
          error: `상태코드:${HttpStatus.BAD_REQUEST}`,
        });
      }
    }
    // console.log(req);
  }

  @Post("search-user")
  async searchuser(@Body() body, @Res() res): Promise<any> {
    const postDatas: Posts[] = await this.postsService.searchUser(
      body.user_nickname
    );

    if (postDatas !== undefined) {
      res.status(200).send({
        user_nickname: body.user_nickname,
        postings: postDatas,
        message: "닉네임별 포스트 데이터 가져오기 완료",
      });
    } else {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `올바르지 않은 요청입니다.`,
        error: `상태코드:${HttpStatus.BAD_REQUEST}`,
      });
    }
  }

  @Post("search-job")
  async searchJob(@Body() body, @Res() res): Promise<any> {
    const postDatas: Posts[] = await this.postsService.searchJob(body.user_job);

    if (postDatas !== undefined) {
      res.status(200).send({
        user_job: body.user_job,
        postDatas,
        message: "직업별 포스트 데이터 가져오기 완료",
      });
    } else {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `올바르지 않은 요청입니다.`,
        error: `상태코드:${HttpStatus.BAD_REQUEST}`,
      });
    }
  }

  @Post("search-tag")
  async searchTag(@Body() body, @Res() res): Promise<any> {
    const tagDatas: Tags[] = await this.postsService.searchTagPostId(body.tag);

    const tagNumbers: number[] = await this.postsService.searchTagPostIdNumber(
      tagDatas
    );

    const postDatas: Posts[] = await this.postsService.searchTag(tagNumbers);

    // console.log(postDatas[0].posts.id);

    if (postDatas !== undefined) {
      res.status(200).send({
        user_tag: body.tag,
        postDatas,
        message: "태그별 포스트 데이터 가져오기 완료.",
      });
    } else {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `올바르지 않은 요청입니다.`,
        error: `상태코드:${HttpStatus.BAD_REQUEST}`,
      });
    }
  }

  @Post("search-popular")
  async searchPopular(@Body() body, @Res() res): Promise<any> {
    let postDatas: Posts[];
    const user_job: string = body.user_job;

    if (user_job !== undefined) {
      postDatas = await this.postsService.searchPopular(user_job);
    } else {
      postDatas = await this.postsService.searchPopular();
    }

    // console.log(postDatas[0].posts.id);

    if (postDatas !== undefined) {
      res.status(200).send({
        postDatas,
        message: "인기순 포스트 데이터 가져오기 완료.",
      });
    } else {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `올바르지 않은 요청입니다.`,
        error: `상태코드:${HttpStatus.BAD_REQUEST}`,
      });
    }
  }

  @Get("mainfeed")
  async mainfeed(@Req() req, @Res() res): Promise<any> {
    let decoded: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );
      // console.log("refresh", refresh);
      if (refresh === null) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: `접근 권한이 없습니다.`,
          error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
        });
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        decoded = await this.tokenService.resolveAccessToken(accessToken);

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }

    if (decoded === null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: `접근 권한이 없습니다.`,
        error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
      });
    } else {
      const postDatas: Posts[] = await this.postsService.searchAll();

      const ranking: Users[] = await this.postsService.searchRank();

      // console.log(postDatas[0].posts.id);
      if (postDatas !== undefined && ranking !== undefined) {
        res.status(200).send({
          postDatas,
          ranking: ranking,
          message: "전체 포스트 및 랭킹순 포스트 가져오기 완료",
        });
      } else {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `올바르지 않은 요청입니다.`,
          error: `상태코드:${HttpStatus.BAD_REQUEST}`,
        });
      }
    }
  }

  @Post("change-thumbsup")
  async change_thumbsup(@Req() req, @Res() res): Promise<any> {
    let decoded: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );
      //console.log("refresh", refresh);
      if (refresh === null) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: `접근 권한이 없습니다.`,
          error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
        });
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        decoded = await this.tokenService.resolveAccessToken(accessToken);

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }
    if (decoded === null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: `접근 권한이 없습니다.`,
        error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
      });
    } else {
      const postDatas: string = await this.postsService.changeThumbsUp(
        decoded.user.id,
        req.body.post_PK
      );

      res.status(200).send({ thumbs_up: postDatas });
    }
  }

  @Post("search-thumbsup")
  async searchThumbsUp(@Req() req, @Res() res): Promise<any> {
    let decoded: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );
      //console.log("refresh", refresh);
      if (refresh === null) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: `접근 권한이 없습니다.`,
          error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
        });
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        decoded = await this.tokenService.resolveAccessToken(accessToken);

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }
    if (decoded === null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: `접근 권한이 없습니다.`,
        error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
      });
    } else {
      const searchDatas: boolean = await this.postsService.searchThumbsUp(
        decoded.user.id,
        req.body.post_PK
      );
      if (searchDatas === undefined) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `올바르지 않은 요청입니다.`,
          error: `상태코드:${HttpStatus.BAD_REQUEST}`,
        });
      } else {
        res.status(200).send(searchDatas);
      }
    }
  }

  @Get("myfeed")
  async getPost(@Req() req, @Res() res): Promise<any> {
    // console.log(req.cookies);
    let decoded: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    // console.log("decoded:", decoded);

    if (decoded === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );
      // console.log("refresh", refresh);
      if (refresh === null) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: `접근 권한이 없습니다.`,
          error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
        });
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        decoded = refresh;
        // console.log("decoded:", decoded);

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }

    if (decoded === null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: `접근 권한이 없습니다.`,
        error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
      });
    }

    const getPostingData: any = await this.postsService.getPost(
      decoded.user.id
    );
    // console.log(getPostingData);
    if (getPostingData === false) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `유효한 유저가 아닙니다.`,
        error: `상태코드:${HttpStatus.NOT_FOUND}`,
      });
    } else if (getPostingData.postdata.length === 0) {
      return res.status(200).send({
        message: "작성된 포스팅이 없습니다.",
        userDatas: getPostingData.userdata,
        postDatas: [],
      });
    } else {
      return res.status(200).send({
        message: "포스팅 가져오기 성공",
        userDatas: getPostingData.userdata,
        postDatas: getPostingData.postdata,
      });
    }
  }

  // 컨트롤러 내에서 accessToken 복호화
  @Delete("myfeed")
  async deletePost(@Req() req, @Res() res): Promise<any> {
    let decoded: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );
      //console.log("refresh", refresh);
      if (refresh === null) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: `접근 권한이 없습니다.`,
          error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
        });
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        decoded = await this.tokenService.resolveAccessToken(accessToken);

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }
    if (decoded === null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: `접근 권한이 없습니다.`,
        error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
      });
    } else {
      // console.log(decoded);
      const deletePostingData: boolean = await this.postsService.deletePost(
        req.body.post_PK,
        decoded.user.id
      );
      // console.log(deletePostingData);
      if (deletePostingData === true) {
        res.status(200).send("포스팅 삭제 성공");
      } else {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `포스팅 삭제 실패.`,
          error: `상태코드:${HttpStatus.BAD_REQUEST}`,
        });
      }
    }
  }

  @Patch("myfeed")
  async patchPost(@Req() req, @Res() res): Promise<any> {
    let decoded: any = await this.tokenService.resolveAccessToken(
      req.cookies.accessToken
    );
    if (decoded === null) {
      const refresh: any = await this.tokenService.decodeRefreshToken(
        req.cookies.refreshToken
      );
      // console.log("refresh", refresh);
      if (refresh === null) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: `접근 권한이 없습니다.`,
          error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
        });
      } else {
        const accessToken: string = await this.tokenService.generateAccessToken(
          refresh.user
        );
        decoded = await this.tokenService.resolveAccessToken(accessToken);

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 2, // 2시간
          domain: "dawn-on.club",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "None",
        });
      }
    }
    if (decoded === null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: `접근 권한이 없습니다.`,
        error: `상태코드:${HttpStatus.UNAUTHORIZED}`,
      });
    } else {
      console.log(decoded.user);
      const patchPostingData: boolean = await this.postsService.patchPost(
        decoded.user.id,
        req.body.postdatas
      );
      // console.log(patchPostingData);
      if (patchPostingData === true) {
        res.status(200).send("포스팅 업데이트 성공");
      } else {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `포스팅 업데이트 실패`,
          error: `상태코드:${HttpStatus.BAD_REQUEST}`,
        });
      }
    }
  }

  // @Post('ranking')
  // async change_thumbsup(@Body() body, @Res() res) {
  //   const postDatas = await this.postsService.changeThumbsUp(
  //     body.user_PK,
  //     body.post_PK,
  //   );

  //   console.log(postDatas);
  //   res.status(200).send({ thumbs_up: postDatas });
  // }
}
