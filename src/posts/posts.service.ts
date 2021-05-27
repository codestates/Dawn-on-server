import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
// import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from "@nestjs/typeorm";
import { Posts } from "src/entities/Posts.entity";
import { Stars } from "src/entities/Star_collections.entity";
import { Users } from "src/entities/Users.entity";
import { StarsService } from "src/stars/stars.service";
import { UsersService } from "src/users/users.service";
import { Connection, Repository } from "typeorm";
import { CreateDataDto } from "src/dtos/create-data.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class PostsService {
  constructor(
    private connection: Connection,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,

    private usersService: UsersService,

    @InjectRepository(Stars)
    private starsRepository: Repository<Stars>,
    private starsService: StarsService,

    @InjectRepository(Posts)
    private postsRepository: Repository<Posts>,
  ) {
    this.usersRepository = usersRepository;
    this.usersService = usersService;
    this.starsRepository = starsRepository;
    this.starsService = starsService;
    this.postsRepository = postsRepository;

    this.connection = connection;
  }

  async searchUser(user_id: string): Promise<Posts[]> {
    const userdata = await this.usersRepository.findOne({ user_id: user_id });

    const userId = userdata.id;

    return this.postsRepository.find({ users: userId });
  }

  async searchAll(user_job: string): Promise<any> {
    const userdata = await this.usersRepository.find({ user_job: user_job });

    let userId = [];

    userdata.map((el) => {
      userId.push(el.id);
    });

    let postDatas: Posts[];

    for (let i = 0; i < userId.length; i++) {
      let eldates = await this.postsRepository.find({ users: userId[i] });
      postDatas.push(...eldates);
    }

    return {
      message: "직업별 포스트 데이터 가져오기 완료",
      postDatas: postDatas,
    };
  }

  async posting(user_id: string, postdatas: any): Promise<any> {
    const userId = await this.usersRepository.findOne({ user_id: user_id });

    const newPostOBJ = new Posts();

    newPostOBJ.date = new Date();

    newPostOBJ.tag = postdatas.tag;
    newPostOBJ.back_color = postdatas.back_color;
    newPostOBJ.today_learning_time = postdatas.today_learning_time;
    newPostOBJ.comment = postdatas.comment;
    newPostOBJ.thumbs_up = postdatas.thumbs_up;
    newPostOBJ.users = userId.id;

    await this.postsRepository.save(newPostOBJ);

    return { message: "포스팅 완료.", newpost: newPostOBJ };
  }
}
