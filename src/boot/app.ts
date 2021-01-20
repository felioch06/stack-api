import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import morgan from 'morgan';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { appConfig } from '../config/app';
import { langMiddleware } from '../api/middlewares/lang.middleware';
import router from '../api/routes';

export const initializeApp = () => {
  const app = express();
  let server = null;
  const appconf = appConfig();

  // initialize contrib middlewares
  app.use(bodyParser.json());
  app.use(cors());
  app.use(helmet());
  app.use(fileUpload());
  app.use(morgan('dev'));

  // initilize custom middlewares
  app.use(langMiddleware);

  // initialize router
  app.use(router());

  if (appconf.https) {
    const certName = appconf.name.toLowerCase().replace(/\s/g, '-');
    console.log(`${appconf.name} working over HTTPS`);
    const key = fs.readFileSync(`/etc/ssl/${certName}.key`);

    const cert = fs.readFileSync(`/etc/ssl/${certName}.crt`);
    server = https.createServer(
      {
        key,
        cert,
      },
      app
    );
  } else {
    server = http.createServer(app);
  }

  server.listen(parseInt(process.env.PORT as string), () => {
    // eslint-disable-next-line no-console
    console.log(
      `Server started on port ${process.env.PORT}.\nEnvironment = ${process.env.NODE_ENV}`
    );
  });
};
