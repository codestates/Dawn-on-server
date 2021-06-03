import { ForbiddenException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { TokenExpiredError } from "jsonwebtoken";
import { RefreshToken } from "src/entities/RefreshToken.entity";
import { Users } from "src/entities/Users.entity";
import { UsersService } from "src/users/users.service";
import { Repository } from "typeorm";
import { config } from "dotenv";
config();

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private jwtService: JwtService,
    private usersService: UsersService,

    @InjectRepository(RefreshToken)
    private refreshRepository: Repository<RefreshToken>
  ) {
    this.refreshRepository = refreshRepository;
    this.usersRepository = usersRepository;
    this.jwtService = jwtService;
    this.usersService = usersService;
  }

  async findTokenById(id: string): Promise<RefreshToken | null> {
    return this.refreshRepository.findOne({ where: { id } });
  }

  // 리프레쉬 토큰 생성 및 디비 저장.
  async createRefreshToken(user: Users): Promise<RefreshToken> {
    const refreshToken: RefreshToken = new RefreshToken();
    refreshToken.user = user;

    const existedToken: any = await this.refreshRepository
      .createQueryBuilder("refreshToken")
      .leftJoinAndSelect("refreshToken.user", "user")
      .where("user.id = :id", { id: user.id })
      .getOne();

    if (existedToken) {
      await this.refreshRepository
        .createQueryBuilder("refreshToken")
        .delete()
        .where("id = :id", { id: existedToken.id })
        .execute();
    }

    await this.refreshRepository.save(refreshToken);
    return refreshToken;
  }

  // 리프레쉬 토큰 암호화
  async generateRefreshToken(user: any): Promise<string> {
    const token: RefreshToken = await this.createRefreshToken(user);
    const payload: any = { user_id: user.user_id, user: user };

    const opts: any = {
      jwtid: String(token.id),
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: "30d",
    };
    return this.jwtService.sign(payload, opts);
  }

  // 유요한 리프레쉬 토큰인지 확인.
  async resolveRefreshToken(
    encoded: string
  ): Promise<{ user: Users; token: RefreshToken }> {
    const payload: any = await this.decodeRefreshToken(encoded);
    const token: RefreshToken =
      await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: ["토큰이 존재하지 않습니다."],
        error: "Forbidden",
      });
    }

    const user: Users = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: ["유효하지 않은 토큰입니다."],
        error: "Forbidden",
      });
    }

    return { user, token };
  }

  //리프레쉬 토큰 복호화
  async decodeRefreshToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch (e) {
      return null;
      // if (e instanceof TokenExpiredError) {
      //   throw new ForbiddenException({
      //     statusCode: HttpStatus.FORBIDDEN,
      //     message: ["Refresh token expired"],
      //     error: "Forbidden",
      //   });
      // } else {
      //   throw new ForbiddenException({
      //     statusCode: HttpStatus.FORBIDDEN,
      //     message: ["유효하지 않은 토큰입니다."],
      //     error: "Forbidden",
      //   });
      // }
    }
  }

  // 우리 유저가 맞는지 확인
  async getUserFromRefreshTokenPayload(payload: any): Promise<Users> {
    const subId: any = payload.user;

    if (!subId) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: ["유효하지 않은 토큰입니다."],
        error: "Forbidden",
      });
    }

    return this.usersService.findOne(subId);
  }

  // 만료된 토큰인지 확인
  async getStoredTokenFromRefreshTokenPayload(
    payload: any
  ): Promise<RefreshToken> {
    const tokenId: string = payload.user_id;
    if (!tokenId) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: ["Refresh token expired"],
        error: "Forbidden",
      });
    }
    return this.findTokenById(tokenId);
  }

  // 리프레쉬토큰 삭제(유효기간 만료된 토큰 삭제)
  async deleteRefreshTokenFromUser(user: Users): Promise<void> {
    await this.refreshRepository
      .createQueryBuilder("refreshToken")
      .leftJoinAndSelect("refreshToken.user", "user")
      .delete()
      .where("user.id = :id", { id: user.id })
      .execute();
  }

  // 엑세스 토큰 암호화
  async generateAccessToken(user: any): Promise<string> {
    const payload: any = { user_id: user.user_id, user: user };

    const opts: any = {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: "10s",
    };
    return this.jwtService.sign(payload, opts);
  }

  // 엑세스 토큰 유효성 검사
  async resolveAccessToken(encoded: string): Promise<any> {
    try {
      return this.jwtService.verify(encoded, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch (e) {
      return null;
    }
  }

  // 만료 엑세스 토큰 리프레쉬 토큰으로 재발급
  async createAccessTokenFromRefreshToken(
    refresh: string
  ): Promise<{ token: string; user: Users }> {
    const {
      user,
    }: {
      user: Users;
      token: RefreshToken;
    } = await this.resolveRefreshToken(refresh);

    const token:string = await this.generateAccessToken(user);

    return { user, token };
  }

  async regenerationToken(req: any): Promise<any> {
    let verify: any;
    let accessToken: string;
    if (req.user === null) {
      const refresh:any = await this.decodeRefreshToken(req.cookies.refreshToken);
      //console.log("refresh", refresh);
      if (refresh === null) {
        return false;
      } else {
        accessToken = await this.generateAccessToken(refresh.user);
        console.log("accsses", accessToken);
        verify = await this.resolveAccessToken(accessToken);
      }
    }
    return { accessToken, verify };
  }
}
