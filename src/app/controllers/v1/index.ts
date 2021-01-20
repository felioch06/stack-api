import { Container } from 'typedi';
import { AppController } from './app.controller';
import { FileController } from './file.controller';
import { OnboardingController } from './onboarding.controller';
import { CrudController } from './crud.controller';
import { CatController } from './cat.controller';

export const appController = Container.get(AppController);
export const fileController = Container.get(FileController);
export const onboardingController = Container.get(OnboardingController);
export const crudController = Container.get(CrudController);
export const catController = Container.get(CatController);
