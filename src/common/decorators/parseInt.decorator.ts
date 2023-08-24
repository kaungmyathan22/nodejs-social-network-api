// src/common/decorators/parse-int.decorator.ts

import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';

export const ParseInt = createParamDecorator(
  () => (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const param = request.params.id; // Change 'id' to the parameter name you want to validate

    const parsedInt = parseInt(param, 10);
    if (isNaN(parsedInt)) {
      throw new BadRequestException(
        `Invalid parameter value for 'id'. It must be an integer.`,
      );
    }

    return parsedInt;
  },
);
