import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiPostResponse } from '../../decorators/swagger.decorator';
import { SigninResDto, SignupResDto } from './dto/res.dto';

@Controller('user')
@ApiTags('User')
@ApiExtraModels(SignupResDto, SigninResDto)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiPostResponse(SignupResDto)
  @Post()
  signup(@Body(new ValidationPipe()) data: CreateUserDto) {
    return this.userService.createUser(data);
  }

  @ApiPostResponse(SigninResDto)
  @Post('login')
  login(@Body(new ValidationPipe()) data: LoginUserDto) {
    return this.userService.login(data);
  }

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }
}
