import { Container } from 'typedi';
import { createConnection, useContainer } from 'typeorm';
import models from '../app/models';
import { databaseConfig } from '../config/database';

export const initializeDb = () => {
  const config = databaseConfig();

  useContainer(Container);

  return createConnection({
    type: config.type as any,
    database: config.database,
    username: config.username,
    password: config.password,
    host: config.host,
    port: config.port,
    synchronize: true,
    entities: models,
  });
};
