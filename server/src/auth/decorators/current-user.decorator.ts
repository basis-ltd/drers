import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

export interface JwtUser {
  sub: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as JwtUser | undefined;
    if (!user?.sub) {
      throw new UnauthorizedException('Authentication required.');
    }
    return user;
  },
);
