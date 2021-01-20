import { NextFunction, Request, Response } from 'express';
import { langConfig } from '../../config/lang';

export const langMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let lang = (req.header('lang') as string) || langConfig.defaultLanguage;

  if (!langConfig.availableLanguages.includes(lang)) {
    lang = langConfig.defaultLanguage;
  }

  import(`../../resources/lang/${lang}`).then((langDefs: any) => {
    (req as any).lang = langDefs.default;
    next();
  });
};
