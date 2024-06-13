import { CreateUserDto } from './dto/create-user.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, compare } from 'bcrypt';
import { Board } from '../../entity/board.entity';
import { User } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async getUserForLogin(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // Explicitly select the password field
      .where('user.email = :email', { email })
      .getOne();
  }

  async createUser(data: CreateUserDto) {
    const { username, email, password } = data;

    const user = await this.getUserForLogin(email);
    if (user) throw new HttpException('CONFLICT', HttpStatus.CONFLICT);

    const encryptedPassword = await this.encryptPassword(password);

    return this.userRepository.save({
      username,
      email,
      password: encryptedPassword,
    });
  }

  async login(data: LoginUserDto) {
    const { email, password } = data;

    const user = await this.getUserForLogin(email);

    if (!user) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);

    const match = await compare(password, user.password);

    if (!match)
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const payload = {
      username: user.username,
      email: user.email,
    };

    const accessToken = jwt.sign(
      payload,
      this.configService.get('JWT_SECRET'),
      {
        expiresIn: this.configService.get('JWT_LIFETIME'),
      },
    );

    return {
      accessToken,
    };
  }

  async getUsers() {
    const qb = this.userRepository.createQueryBuilder();

    qb.addSelect((subQuery) => {
      return subQuery
        .select('count(id)')
        .from(Board, 'Board')
        .where('Board.userId = User.id');
    }, 'User_boardCount');

    return qb.getMany();
  }

  async encryptPassword(password: string) {
    return hash(password, Number(this.configService.get('DEFAULT_SALT')));
  }
}
