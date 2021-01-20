export const awsConfig = () => ({
  region: process.env.AWS_REGION,
  smsType: process.env.AWS_SMS_TYPE,
  version: process.env.AWS_VERSION,
  phoneNumber: process.env.AWS_DEFAULT_PHONE_NUMBER,
  bucket: process.env.AWS_BUCKET,
  usersFolder: process.env.AWS_USER_FOLDER,
});
