import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
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
import { PageReqDto } from '../../common/dto/page-request.dto';

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
  ): Promise<SignupResDto> {
    if (password !== passwordConfirm) throw new BadRequestException();
    const { id, accessToken, refreshToken } = await this.userService.createUser(
      {
        username,
        email,
        password,
      },
    );
    return { id, accessToken, refreshToken };
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
  async getUsers(
    @Query() { page, size }: PageReqDto,
  ): Promise<FindUserResDto[]> {
    const users = await this.userService.getUsers(page, size);
    return users.map(({ id, email, username, createdAt, boardCount }) => {
      return {
        id,
        email,
        username,
        createdAt: createdAt.toISOString(),
        boardCount,
      };
    });
  }
}
