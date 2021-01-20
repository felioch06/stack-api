import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import {
  controllerResponse,
  createErrorResponse,
} from '../../libraries/core/response';
import { Jwt } from '../interfaces/jwt.interface';

export const vertifyTokenMiddleware = (token: 'access' | 'auth') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appShortName = (process.env.SHORT_NAME as string).toUpperCase();
      const headerName = token === 'access' ? 'Access' : 'Auth';
      const header = req.header(
        `X-${appShortName}-${headerName}-Token`
      ) as string;

      if (!header) {
        return controllerResponse(
          createErrorResponse({
            message: (req as any).lang.onboarding.token.notFound,
            httpStatusCode: 400,
            code: 120,
          }),
          res
        );
      }

      const tokenVerifiedContent = verify(
        header,
        process.env.JWT_SECRET
      ) as Jwt;

      if (!tokenVerifiedContent) {
        return controllerResponse(
          createErrorResponse({
            code: 120,
            httpStatusCode: 403,
            message: (req as any).lang.onboarding.token.invalid,
          }),
          res
        );
      }

      if (token === 'auth') {
        const model = (await import(
          `../../app/models/${tokenVerifiedContent.modelName}.model`
        ).then(md => Object.values(md)[0])) as any;

        const tokenModel = (await import(
          `../../app/models/${tokenVerifiedContent.modelName}-token.model`
        ).then(md => Object.values(md)[0])) as any;

        const repository = getRepository(model);
        const tokenRepository = getRepository(tokenModel);

        const user = await repository.findOne({
          where: {
            id: tokenVerifiedContent.id,
          },
        });

        if (!user) {
          return controllerResponse(
            createErrorResponse({
              message: (req as any).lang.onboarding.token.error,
              code: 120,
            }),
            res
          );
        }

        await tokenRepository.update(
          {
            user: {
              id: tokenVerifiedContent.id,
            },
          },
          {
            lastUsed: new Date(),
          }
        );

        (req as any).user = user;
        (req as any).modelName = tokenVerifiedContent.modelName;
      }

      next();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en verify token:', error);
      return controllerResponse(
        createErrorResponse({
          code: 120,
          message: (req as any).onboarding.token.error,
        }),
        res
      );
    }
  };
};
