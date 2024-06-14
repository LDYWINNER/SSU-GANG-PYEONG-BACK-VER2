import { Controller, Get, Query } from '@nestjs/common';
import { ApiServerService } from './api-server.service';
import { ConfigService } from '@nestjs/config';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class ApiServerController {
  constructor(
    private readonly apiServerService: ApiServerService,
    private readonly configService: ConfigService,
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
}
