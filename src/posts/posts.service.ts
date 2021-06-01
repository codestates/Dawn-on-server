import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  Post,
} from "@nestjs/common";
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
import { RespostDataDto } from "src/dtos/respost-data.dto";
import { PostsModule } from "./posts.module";
import { Likes } from "src/entities/Likes.entity";

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

    @InjectRepository(Todos)
    private todosRepository: Repository<Todos>,

    @InjectRepository(Posts)
    private postsRepository: Repository<Posts>,

    @InjectRepository(Likes)
    private likesRepository: Repository<Likes>
  ) {
    this.usersRepository = usersRepository;
    this.usersService = usersService;
    this.starsRepository = starsRepository;
    this.starsService = starsService;
    this.postsRepository = postsRepository;
    this.todosRepository = todosRepository;
    this.tagsRepository = tagsRepository;
    this.likesRepository = likesRepository;

    this.connection = connection;
  }

  async searchAll(): Promise<Posts[]> {
    const postdata = await this.postsRepository.find({
      relations: ["users", "todos", "tags"],
      where: {},
    });

    let resultData = [];
    resultData.push(...postdata);

    resultData = resultData.reverse();

    return resultData;
  }

  async searchUser(user_nickname: string): Promise<Posts[]> {
    const userdata = await this.usersRepository.findOne({
      user_nickname: user_nickname,
    });

    const userId = userdata.id;
    let resultData = [];

    const postdata = await this.postsRepository.find({
      relations: ["users", "todos", "tags"],
      where: { users: userId },
    });

    resultData.push(...postdata);

    return resultData;
  }

  async searchJob(user_job: string): Promise<any> {
    const userdata = await this.usersRepository.find({
      where: { user_job: user_job },
    });
    let resultData = [];
    let userId = [];

    userdata.map((el) => {
      userId.push(el.id);
    });

    for (let i = 0; i < userId.length; i++) {
      let postdata = await this.postsRepository.find({
        relations: ["users", "todos", "tags"],
        where: { users: userId[i] },
      });
      resultData.push(...postdata);
    }

    return resultData;
  }

  // tag검색시 해당 post들 가져오는 메소드
  async searchTagPostId(tag: string): Promise<any> {
    const postdata = await this.tagsRepository.find({
      relations: ["posts"],
      where: { tag: tag },
    });

    return postdata;
  }

  // tag검색한 해당 post의 id를 배열에 담아서 반환하는 메소드
  async searchTagPostIdNumber(tagdata: any): Promise<any> {
    let tagNumbers = [];

    tagdata.map((el) => {
      tagNumbers.push(el.posts.id);
    });
    // console.log(tagNumbers);

    return tagNumbers;
  }

  // tag검색에 유효한 post들을 반환하는 메소드
  async searchTag(tags: number[]): Promise<any> {
    let resultData = [];

    for (let i = 0; i < tags.length; i++) {
      let postdata = await this.postsRepository.find({
        relations: ["users", "todos", "tags"],
        where: { id: tags[i] },
      });
      resultData.push(...postdata);
    }

    // console.log(resultData);

    return resultData;
  }

  async posting(user_nickname: string, postdatas: any): Promise<any> {
    const userId = await this.usersRepository.findOne({
      user_nickname: user_nickname,
    });

    const newPostOBJ = new Posts();

    const newTodoOBJ = new Todos();

    const newTagOBJ = new Tags();

    newPostOBJ.date = new Date();
    newPostOBJ.back_color = postdatas.back_color;
    newPostOBJ.d_day = 20; //아직 미정
    newPostOBJ.sticker = postdatas.sticker;
    newPostOBJ.today_learning_time = 0;
    newPostOBJ.comment = postdatas.comment;
    newPostOBJ.thumbs_up = 0;
    newPostOBJ.memo = postdatas.memo;

    newPostOBJ.users = userId.id;

    const postId = await this.postsRepository.save(newPostOBJ);

    let total_learing_time = 0;

    for (let i = 0; i < postdatas.todos.length; i++) {
      let newTodoOBJ = new Todos();
      let el = postdatas.todos[i];
      newTodoOBJ.box_color = el.box_color;
      newTodoOBJ.learning_time = el.learning_time;
      total_learing_time = total_learing_time + el.learning_time;
      newTodoOBJ.subject = el.subject;
      newTodoOBJ.todo_comment = el.todo_comment;
      newTodoOBJ.start_time = el.start_time;
      if (el.checked !== undefined) {
        newTodoOBJ.checked = el.checked;
      }
      newTodoOBJ.posts = postId.id;

      await this.todosRepository.save(newTodoOBJ);
    }

    postId.today_learning_time = total_learing_time;

    const lastPost = await this.postsRepository.save(postId);

    for (let i = 0; i < postdatas.tags.length; i++) {
      let newTagOBJ = new Tags();
      let el = postdatas.tags[i];

      newTagOBJ.posts = postId.id;
      newTagOBJ.tag = el;

      await this.tagsRepository.save(newTagOBJ);
    }

    const newTags = await this.tagsRepository.find({ posts: lastPost.id });
    let newTagsString = [];
    newTags.map((el) => {
      newTagsString.push(el.tag);
    });

    const newTodos = await this.todosRepository.find({ posts: lastPost.id });
    userId.total_posting = userId.total_posting + 1;
    await this.usersRepository.save(userId);

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

  async searchRank(): Promise<any> {
    const totalThumbUp = await this.usersRepository.find();
    let resultData = [];

    totalThumbUp.sort((a, b) => (a.total_thumbsup > b.total_thumbsup ? -1 : 1));

    //console.log(totalThumbUp);

    for (let i = 0; i < 10; i++) {
      if (totalThumbUp[i] !== undefined) {
        resultData.push(totalThumbUp[i]);
      }
    }

    return resultData;
  }

  async totalLearningTime(user_nickname: string): Promise<number> {
    let userId = await (
      await this.usersRepository.findOne({ user_nickname: user_nickname })
    ).id;

    let postdata = await this.postsRepository.find({ users: userId });

    let total_learing_time = 0;

    for (let i = 0; i < postdata.length; i++) {
      total_learing_time = total_learing_time + postdata[i].today_learning_time;
    }

    return total_learing_time;
  }

  async totalThumbUp(user_nickname: string): Promise<number> {
    let userId = await (
      await this.usersRepository.findOne({ user_nickname: user_nickname })
    ).id;

    let postdata = await this.postsRepository.find({ users: userId });

    let total_thumbs_up = 0;

    for (let i = 0; i < postdata.length; i++) {
      total_thumbs_up = total_thumbs_up + postdata[i].thumbs_up;
    }

    return total_thumbs_up;
  }

  async userThumbsUp(postDatas: any): Promise<any> {
    const userId = postDatas.users.id;
    //console.log(userId);
    return userId;
  }

  async changeThumbsUp(user_PK: number, post_PK: number): Promise<string> {
    const ids = {
      users: user_PK,
      posts: post_PK,
    };

    const compare = await this.likesRepository.findOne(ids);
    //console.log(compare);

    if (compare === undefined) {
      await this.likesRepository.save(ids);
      const postid = await this.postsRepository.findOne({
        relations: ["users", "todos", "tags"],
        where: { id: post_PK },
      });

      const user_PK2 = await this.userThumbsUp(postid);

      const userid = await this.usersRepository.findOne({ id: user_PK2 });

      if (postid !== undefined) {
        postid.thumbs_up = postid.thumbs_up + 1;
        await this.postsRepository.save(postid);
        userid.total_thumbsup = userid.total_thumbsup + 1;
        await this.usersRepository.save(userid);
      }
      return "up";
    } else {
      await this.likesRepository.delete(ids);
      const postid = await this.postsRepository.findOne({
        relations: ["users", "todos", "tags"],
        where: { id: post_PK },
      });
      const user_PK2 = await this.userThumbsUp(postid);
      const userid = await this.usersRepository.findOne({ id: user_PK2 });
      if (postid !== undefined) {
        postid.thumbs_up = postid.thumbs_up - 1;
        await this.postsRepository.save(postid);
        userid.total_thumbsup = userid.total_thumbsup - 1;
        await this.usersRepository.save(userid);
      }
      return "down";
    }
  }

  async searchThumbsUp(user_PK: number, post_PK: number): Promise<boolean> {
    const ids = {
      users: user_PK,
      posts: post_PK,
    };

    const compare = await this.likesRepository.findOne(ids);
    //console.log(compare);

    if (compare === undefined) {
      return false;
    } else {
      return true;
    }
  }

  async deletePost(post_PK: number, user_PK: number): Promise<boolean> {
    const postId = await this.postsRepository.findOne({ id: post_PK });
    const userId = await this.usersRepository.findOne({ id: user_PK });
    userId.total_posting = userId.total_posting - 1;

    if (postId) {
      await this.postsRepository.delete(postId.id);
      await this.usersRepository.save(userId);
      return true;
    } else {
      return false;
    }
  }

  async pacthPost(post_PK: number, postingData: any): Promise<any> {
    const postId = await this.postsRepository.findOne({ id: post_PK });
    //console.log(postId);
    if (postId !== undefined) {
      postId.comment = postingData.comment;
      postId.memo = postingData.memo;
      postId.todos = postingData.todos;
      postId.sticker = postingData.sticker;
      postId.tags = postingData.tags;
      postId.today_learning_time = postingData.today_learning_time;
      await this.postsRepository.save(postId);
      return true;
    } else {
      return false;
    }
  }

  async getPost(user_PK: number): Promise<any> {
    const userId = await this.usersRepository.findOne({ id: user_PK });
    if (userId === undefined) {
      return false;
    }
    /*  .catch((err) => {
        return false;
      }) */ //console.log(userId);
    let resultData = [];
    const postdata = await this.postsRepository.find({
      relations: ["users", "todos", "tags"],
      where: { users: userId.id },
    });

    resultData.push(...postdata);
    // console.log(resultData);
    return { userdata: userId, postdata: resultData };
  }
}

// post데이타 형식
// let postdatas: {
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

// 너무 아깝다.. ㅠㅠ 관계로 불러오는 법을 너무 늦게 알았다...
// async searchJob(user_job: string): Promise<any> {
//   const userdata = await this.usersRepository.find({ user_job: user_job });

//   let userid = [];

//   userdata.map((el) => {
//     userid.push(el.id);
//   });

//   let resultData = [];

//   for (let i = 0; i < userid.length; i++) {
//     let eldates = await this.postsRepository.find({ users: userid[i] });

//     if (eldates !== null) {
//       for (let j = 0; j < eldates.length; j++) {
//         let postDatas = new RespostDataDto();

//         let data = eldates[j];

//         postDatas.date = data.date;
//         postDatas.sticker = data.sticker;
//         postDatas.memo = data.memo;
//         postDatas.comment = data.comment;
//         postDatas.back_color = data.back_color;
//         postDatas.today_learning_time = data.today_learning_time;
//         postDatas.thumbs_up = data.thumbs_up;

//         let tagdatas = await this.tagsRepository.find({ posts: data.id });
//         let tags = [];
//         tagdatas.map((el) => {
//           tags.push(el.tag);
//         });

//         postDatas.tags = tags;

//         let todosdatas = await this.todosRepository.find({
//           posts: data.id,
//         });
//         postDatas.todos = todosdatas;

//         resultData.push(postDatas);
//       }
//     }
//   }

//   return resultData;
// }
