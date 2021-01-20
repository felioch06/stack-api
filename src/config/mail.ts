export const mailConfig = () => ({
  host: process.env.MAIL_HOST || 'smtp-relay.gmail.com',
  port: parseInt(process.env.MAIL_PORT) || 465,
  secure: process.env.MAIL_SECURE ? process.env.MAIL_SECURE === 'true' : true,
  user: process.env.MAIL_USER || 'testdevops@kubo.co',
  password: process.env.MAIL_PASSWORD || '192hdufdd902*',
});
