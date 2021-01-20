import 'reflect-metadata';
import { initializeApp } from './boot/app';
import { initializeDb } from './boot/typeorm';

async function bootstrap() {
  await initializeDb();
  initializeApp();
}

bootstrap();
