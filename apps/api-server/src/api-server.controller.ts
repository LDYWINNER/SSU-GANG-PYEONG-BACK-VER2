import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiServerService } from './api-server.service';
import { ConfigService } from '@nestjs/config';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ApiPostResponse } from './common/decorators/swagger.decorator';
import { SigninResDto } from './routes/user/dto/res.dto';
import { Public } from './common/decorators/public.decorator';

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

  // jwt 검증용
  @Public()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    return req.user;
  }
}
