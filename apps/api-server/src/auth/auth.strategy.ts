import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Specify 'email' as the username field
  }

  // 자동 수행
  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    // console.log(user, email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
