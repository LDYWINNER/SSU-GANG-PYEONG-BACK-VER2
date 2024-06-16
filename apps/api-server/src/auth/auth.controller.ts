import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Headers,
  Body,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiPostResponse } from '../common/decorators/swagger.decorator';
import { RefreshResDto, SigninResDto, SignupResDto } from './dto/res.dto';
import { Public } from '../common/decorators/public.decorator';
import {
  UserAfterAuth,
  UserInfo,
} from '../common/decorators/user-info.decorator';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ThrottlerBehindProxyGuard } from '../common/guard/throttler-behind-proxy.guard';

@ApiExtraModels(SignupResDto, RefreshResDto)
@UseGuards(ThrottlerBehindProxyGuard)
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiPostResponse(SignupResDto)
  @Public()
  @Post()
  async signup(
    @Body(new ValidationPipe())
    { username, email, password, passwordConfirm }: CreateUserDto,
  ): Promise<SignupResDto> {
    if (password !== passwordConfirm) throw new BadRequestException();
    const { id, accessToken, refreshToken } = await this.authService.createUser(
      {
        username,
        email,
        password,
      },
    );
    return { id, accessToken, refreshToken };
  }

  @Public()
  @ApiPostResponse(SigninResDto)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body(new ValidationPipe()) loginUserDto: LoginUserDto,
    @Request() req,
  ) {
    return this.authService.login(req.user);
  }

  @ApiPostResponse(RefreshResDto)
  @ApiBearerAuth()
  @Post('refresh')
  async refresh(
    @Headers('authorization') authorization: string,
    @UserInfo() userInfo: UserAfterAuth,
  ) {
    const token = /Bearer\s(.+)/.exec(authorization)[1];
    const { accessToken, refreshToken } = await this.authService.refresh(
      token,
      userInfo.id,
    );
    return { accessToken, refreshToken };
  }

  // jwt 검증용
  @Public()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    return req.user;
  }
}
