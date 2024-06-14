import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../routes/user/user.service';
import { compare } from 'bcrypt';
import { User } from '../entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../entity/refresh-token.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.getUserForLogin(email);
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
      expiresIn: this.configService.get('JWT_LIFETIME'),
    });
  }

  private generateRefreshToken(userId: string) {
    const payload = {
      id: userId,
      tokenType: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_LIFETIME'),
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
