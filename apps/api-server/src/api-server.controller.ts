import { Controller, Get } from '@nestjs/common';
import { ApiServerService } from './api-server.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class ApiServerController {
  constructor(
    private readonly apiServerService: ApiServerService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    console.log(this.configService.get('ENVIRONMENT'));
    return this.apiServerService.getHello();
  }
}
