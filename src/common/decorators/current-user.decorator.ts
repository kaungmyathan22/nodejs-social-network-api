import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user as UserEntity;
  },
);
