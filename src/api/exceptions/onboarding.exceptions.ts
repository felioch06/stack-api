import { Request } from 'express';
import { createErrorResponse } from '../../libraries/core/response';

export const userNotFoundException = (req: Request, data?: any) =>
  createErrorResponse({
    httpStatusCode: 404,
    message: (req as any).lang.onboarding.user.notFound,
    data,
  });

export const userNotActiveException = (req: Request) =>
  createErrorResponse({
    httpStatusCode: 400,
    message: (req as any).lang.onboarding.user.inactive,
  });
