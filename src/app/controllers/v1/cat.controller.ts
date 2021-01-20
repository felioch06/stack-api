import { Service } from 'typedi';
import { CrudController } from './crud.controller';
import { Cat } from '../../models/cat.model';

@Service()
export class CatController extends CrudController {
  constructor() {
    super(Cat);
  }
}
