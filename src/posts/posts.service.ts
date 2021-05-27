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
import { Tags } from "src/entities/Tags.entity";
import { Todos } from "src/entities/Todos.entity";

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

    @InjectRepository(Tags)
    private tagsRepository: Repository<Tags>,

    @InjectRepository(Tags)
    private todosRepository: Repository<Todos>,

    @InjectRepository(Posts)
    private postsRepository: Repository<Posts>,
  ) {
    this.usersRepository = usersRepository;
    this.usersService = usersService;
    this.starsRepository = starsRepository;
    this.starsService = starsService;
    this.postsRepository = postsRepository;
    this.todosRepository = todosRepository;
    this.tagsRepository = tagsRepository;

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

    const newTodoOBJ = new Todos();

    const newTagOBJ = new Tags();

    newPostOBJ.date = new Date();

    // newPostOBJ.tag = postdatas.tag;
    newPostOBJ.back_color = postdatas.back_color;
    newPostOBJ.sticker = postdatas.sticker;
    newPostOBJ.today_learning_time = postdatas.today_learning_time;
    newPostOBJ.comment = postdatas.comment;
    newPostOBJ.thumbs_up = postdatas.thumbs_up;
    newPostOBJ.users = userId.id;

    const postId = await this.postsRepository.save(newPostOBJ);

    let total_learing_time = 0;

    for (let i = 0; i < postdatas.todos.length; i++) {
      let el = postdatas.todos[i];
      newTodoOBJ.box_color = el.box_color;
      newTodoOBJ.learning_time = el.learning_time;
      total_learing_time = total_learing_time + el.learning_time;
      newTodoOBJ.subject = el.subject;
      newTodoOBJ.todo_comment = el.todo_comment;
      newTodoOBJ.posts = postId.id;

      await this.todosRepository.save(newTodoOBJ);
    }

    postId.today_learning_time = total_learing_time;

    const lastPost = await this.postsRepository.save(postId);

    for (let i = 0; i < postdatas.tags.length; i++) {
      let el = postdatas.todos[i];

      newTagOBJ.posts = postId.id;
      newTagOBJ.tag = el.tag;

      await this.tagsRepository.save(newTagOBJ);
    }

    const newTags = await this.tagsRepository.find({ posts: lastPost.id });
    let newTagsString = [];
    newTags.map((el) => {
      newTagsString.push(el.tag);
    });

    const newTodos = await this.todosRepository.find({ posts: lastPost.id });

    return {
      message: "포스팅 완료.",
      postId: lastPost.id,
      newpost: {
        newPost: lastPost,
        newTag: newTagsString,
        newTodo: newTodos,
      },
    };
  }
}

// post데이타 형식
// let postdatass: {
//   todos: [
//     { box_color: "노란색"; todo_comment: "수학공부"; subject: "수학"; learning_time: 5 },
//     { box_color: "파란색"; todo_comment: "코딩공부"; subject: "코딩"; learning_time: 5 },
//     { box_color: "빨간색"; todo_comment: "국어공부"; subject: "국어"; learning_time: 5 },
//   ];
//   tags: ["취준", "개발", "코딩"];
//   back_color: "하얀색";
//   sticker: "스티커";
//   comment: "오늘 공부는 참 힘들었다.";
//   memo: "적재-잘지내, 슬프지만 오늘도 달린다.";
// };
