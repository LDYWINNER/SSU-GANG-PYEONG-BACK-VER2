import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiServerService } from './api-server.service';
import { ConfigService } from '@nestjs/config';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ApiPostResponse } from './common/decorators/swagger.decorator';
import { RefreshResDto, SigninResDto } from './routes/user/dto/res.dto';
import { Public } from './common/decorators/public.decorator';
import {
  UserAfterAuth,
  UserInfo,
} from './common/decorators/user-info.decorator';
import { ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels(RefreshResDto)
@Controller()
export class ApiServerController {
  constructor(
    private readonly apiServerService: ApiServerService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    console.log(this.configService.get('ENVIRONMENT'));
    return this.apiServerService.getHello();
  }

  @Public()
  @Get('name')
  getName(@Query('name') name: string): string {
    return `${name} hello`;
  }

  @Public()
  @ApiPostResponse(SigninResDto)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
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
