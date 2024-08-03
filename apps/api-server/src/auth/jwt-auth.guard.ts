import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../routes/user/user.service';
import { UserType } from '../common/enum/user.enum';
import { ROLES_KEY } from '../common/decorators/role.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // skip jwt auth guard for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const http = context.switchToHttp();
    const { url, headers } = http.getRequest<Request>();

    console.log('Authorization Header:', headers['authorization']); // 헤더 값 로깅

    const token = /Bearer\s(.+)/.exec(headers['authorization'])[1];

    const decoded = this.jwtService.decode(token);

    if (url !== '/api/auth/refresh' && decoded['tokenType'] === 'refresh') {
      console.error('accessToken is required');
      throw new UnauthorizedException();
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiredRoles) {
      const userId = decoded['id'];
      return this.userService.checkUserIsAdmin(userId);
    }

    return super.canActivate(context);
  }
}
