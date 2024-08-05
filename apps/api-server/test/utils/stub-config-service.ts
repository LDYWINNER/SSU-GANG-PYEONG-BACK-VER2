import { ConfigService } from '@nestjs/config';

export class StubConfigService extends ConfigService {
  private config: { [key: string]: any } = {};

  constructor(initialConfig: { [key: string]: any } = {}) {
    super();
    this.config = initialConfig;
  }

  get(key: string): any {
    return this.config[key];
  }

  set(key: string, value: any): void {
    this.config[key] = value;
  }
}
