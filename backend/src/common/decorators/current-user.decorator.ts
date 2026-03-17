import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../modules/users/entities/user.entity';

/** JWT payload shape attached to request.user by JwtStrategy */
type JwtUser = { sub: string; email: string };
type RequestUser = User | JwtUser;
type CurrentUserKey = keyof User | keyof JwtUser;

export const CurrentUser = createParamDecorator(
  (
    data: CurrentUserKey | undefined,
    ctx: ExecutionContext,
  ): RequestUser | RequestUser[keyof RequestUser] | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    const user = request.user;

    if (data && user) {
      return user[data] as RequestUser[keyof RequestUser] | undefined;
    }

    return user;
  },
);
