import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../routes/user/user.service';
import { compare } from 'bcrypt';
import { User } from '../entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../entity/refresh-token.entity';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private readonly userService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.getUserForLogin(email);
    console.log(user, email);
    if (user) {
      const match = await compare(password, user.password);
      if (match) {
        return user;
      } else {
        return null;
      }
    }

    return null;
  }

  async getUserForLogin(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // Explicitly select the password field
      .where('user.email = :email', { email })
      .getOne();
  }

  async createUser(data: CreateUserDto) {
    const { username, email, password } = data;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const existingUser = await this.getUserForLogin(email);
      if (existingUser)
        throw new HttpException('CONFLICT', HttpStatus.CONFLICT);

      const encryptedPassword = await this.encryptPassword(password);

      const userEntity = queryRunner.manager.create(User, {
        username,
        email,
        password: encryptedPassword,
      });
      await queryRunner.manager.save(userEntity);

      const accessToken = this.generateAccessToken(userEntity);
      const refreshToken = this.generateRefreshToken(userEntity.id);

      const refreshTokenEntity = queryRunner.manager.create(RefreshToken, {
        user: { id: userEntity.id },
        token: refreshToken,
      });

      await queryRunner.manager.save(refreshTokenEntity);
      await queryRunner.commitTransaction();

      return { id: userEntity.id, accessToken, refreshToken };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  async encryptPassword(password: string) {
    return hash(password, Number(this.configService.get('jwt.salt')));
  }

  async login(user: User) {
    const refreshToken = this.generateRefreshToken(user.id);
    await this.createRefreshTokenUsingUser(user.id, refreshToken);

    return {
      accessToken: this.generateAccessToken(user),
      refreshToken,
    };
  }

  async refresh(token: string, userId: string) {
    const refreshTokenEntity = await this.refreshTokenRepository.findOneBy({
      token,
    });
    if (!refreshTokenEntity) throw new BadRequestException();

    const user = await this.userService.findOneById(userId);
    if (user) throw new BadRequestException();

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(userId);
    refreshTokenEntity.token = refreshToken;
    await this.refreshTokenRepository.save(refreshTokenEntity);
    return { accessToken, refreshToken };
  }

  private generateAccessToken(user: User) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      tokenType: 'access',
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.lifetime'),
    });
  }

  private generateRefreshToken(userId: string) {
    const payload = {
      id: userId,
      tokenType: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.refreshLifetime'),
    });
  }

  private async createRefreshTokenUsingUser(
    userId: string,
    refreshToken: string,
  ) {
    // 기존에 refresh token을 발급받아서 db에 저장한 이력이 있는지 확인
    let refreshTokenEntity = await this.refreshTokenRepository.findOneBy({
      user: { id: userId },
    });
    if (refreshTokenEntity) {
      refreshTokenEntity.token = refreshToken;
    } else {
      refreshTokenEntity = this.refreshTokenRepository.create({
        user: { id: userId },
        token: refreshToken,
      });
    }
    await this.refreshTokenRepository.save(refreshTokenEntity);
  }
}
