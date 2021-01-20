import { Router } from 'express';
import { CatController } from '../../../app/controllers/v1/cat.controller';
import { CrudRouter } from './crud.router';

export default () => {
  const crudRouter = new CrudRouter(new CatController());
  const router = Router();

  crudRouter.Crud(router);
  return router;
};
