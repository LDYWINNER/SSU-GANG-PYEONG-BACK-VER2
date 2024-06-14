import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import {
  ApiGetItemsResponse,
  ApiPostResponse,
} from '../../common/decorators/swagger.decorator';
import { FindUserResDto, SigninResDto, SignupResDto } from './dto/res.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/enum/user.enum';

@Controller('user')
@ApiTags('User')
@ApiExtraModels(SignupResDto, SigninResDto)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiPostResponse(SignupResDto)
  @Public()
  @Post()
  async signup(
    @Body(new ValidationPipe())
    { username, email, password, passwordConfirm }: CreateUserDto,
  ) {
    if (password !== passwordConfirm) throw new BadRequestException();
    const { id } = await this.userService.createUser({
      username,
      email,
      password,
    });
    return { id };
  }

  @ApiPostResponse(SigninResDto)
  @Public()
  @Post('login')
  login(@Body(new ValidationPipe()) data: LoginUserDto) {
    return this.userService.login(data);
  }

  @ApiGetItemsResponse(FindUserResDto)
  @Roles(Role.Admin)
  @Get()
  getUsers() {
    return this.userService.getUsers();
  }
}
