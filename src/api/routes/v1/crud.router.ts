import { Router } from 'express';
import { CrudController } from '../../../app/controllers/v1/crud.controller';
import { vertifyTokenMiddleware } from '../../middlewares/verify-token.middleware';

export class CrudRouter {
  crud: CrudController;

  constructor(controller: CrudController) {
    this.crud = controller;
  }

  Crud(router: Router) {
    router.get('/', vertifyTokenMiddleware('auth'), this.crud.get);
    router.get('/:limit/:offset', vertifyTokenMiddleware('auth'), this.crud.getPager);
    router.get('/:id', vertifyTokenMiddleware('auth'), this.crud.getOne);
    router.put('/:id', vertifyTokenMiddleware('auth'), this.crud.update);
    router.post('/', vertifyTokenMiddleware('auth'), this.crud.create);
    router.post('/filter', vertifyTokenMiddleware('auth'), this.crud.filter);
    router.delete('/:id', vertifyTokenMiddleware('auth'), this.crud.delete);
    router.put('/change-status/:id', vertifyTokenMiddleware('auth'), this.crud.changeStatus);
  }
}
