import { Router } from 'express';
import { appController } from '../../../app/controllers/v1';

export default () => {
  const router = Router();
  router.get('/generate-access-token', appController.getAccessToken);
  router.post('/check-version', appController.checkAppVersion);
  return router;
};
