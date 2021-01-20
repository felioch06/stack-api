import { Router } from 'express';
import appRouter from './app.router';
import fileRouter from './file.router';
import onboardingRouter from './onboarding.router';
import catRouter from './cat.router';

export default () => {
  const router = Router();
  const shortName = process.env.SHORT_NAME;

  router.use(`/${shortName}`, appRouter());

  router.use('/files', fileRouter());

  router.use('/onboarding', onboardingRouter());

  router.use('/cat', catRouter());

  return router;
};
