import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

import { resolveLocale, type SupportedLocale } from './locale.constants';

export const Locale = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SupportedLocale => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const raw = (req.query['lang'] as string | undefined) ?? req.headers['accept-language'];
    return resolveLocale(raw);
  },
);
