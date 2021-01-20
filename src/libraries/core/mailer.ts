import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import * as path from 'path';
import * as fs from 'fs';
import { Service } from 'typedi';
import { appConfig } from '../../config/app';
import { mailConfig } from '../../config/mail';

@Service()
export class Mailer {
  transport: Transporter;

  appConfig: any;

  constructor() {
    const config = mailConfig();
    this.appConfig = appConfig();

    console.log('Sending email from:', config.user);

    this.transport = createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    } as any);

    let templatesPath = path.resolve(
      process.cwd(),
      'src',
      'resources',
      'views'
    );

    if (!fs.existsSync(templatesPath)) {
      templatesPath = path.resolve(process.cwd(), 'dist', 'resources', 'views');
    }

    this.transport.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          layoutsDir: path.join(
            process.cwd(),
            'src',
            'resources',
            'views',
            'layouts'
          ),
        },
        viewPath: templatesPath,
        extName: '.hbs',
      })
    );
  }

  sendMail = (
    options: SendMailOptions & { template: string; context: any }
  ) => {
    return this.transport.sendMail({
      ...options,
      context: {
        ...options.context,
        app: {
          ...this.appConfig,
        },
      },
    } as any);
  };
}
