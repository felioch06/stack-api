import { Router } from 'express';
import { fileController } from '../../../app/controllers/v1';

export default () => {
  const router = Router();

  router.post('/single-upload', fileController.uploadFile);
  router.post('/multiple-upload', fileController.uploadFiles);

  return router;
};
