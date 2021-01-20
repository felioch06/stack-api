export const appConfig = () => ({
  name: process.env.NAME,
  shortName: process.env.SHORT_NAME,
  multipleLogin: process.env.MULTIPLE_LOGIN === 'true',
  https: process.env.HTTPS === 'true',
});
