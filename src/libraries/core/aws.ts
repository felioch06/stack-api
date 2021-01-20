import aws from 'aws-sdk';
import { Service } from 'typedi';
import { appConfig } from '../../config/app';
import { awsConfig } from '../../config/aws';

@Service()
export class AwsLib {
  private config: any;

  private bucketName: string;

  constructor() {
    this.config = awsConfig();

    this.bucketName = this.config.bucket + appConfig().shortName;

    aws.config.update({
      region: this.config.region,
    });
  }

  getSnsInstance = () => {
    return new aws.SNS({
      apiVersion: this.config.version,
    });
  };

  getS3Instance = () => {
    return new aws.S3();
  };

  //#region SMS methods

  checkIfNumberExists = async (phoneNumber: string) => {
    try {
      const snsInstance = this.getSnsInstance();
      const phoneCheck = await snsInstance
        .checkIfPhoneNumberIsOptedOut({
          phoneNumber,
        })
        .promise();

      return {
        code: 100,
        data: phoneCheck,
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error in awslib', e);
      return {
        code: 102,
        data: e,
      };
    }
  };

  sendSMS = async (
    phoneNumber: string = this.config.phoneNumber,
    message = 'Mensaje de prueba'
  ) => {
    try {
      const params = {
        Message: message,
        PhoneNumber: phoneNumber,
      };

      const snsInstance = this.getSnsInstance();

      const messageResponse = await snsInstance.publish(params).promise();

      return {
        code: 100,
        data: messageResponse,
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error in awslib', e);
      return {
        code: 102,
        data: e,
      };
    }
  };

  //#endregion

  //#region Upload files

  uploadFile = async (fileKey: string, content: any) => {
    const s3Instance = this.getS3Instance();

    await s3Instance
      .putObject({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: content,
        ACL: 'WRITE',
      })
      .promise();

    return fileKey;
  };

  deleteFile = (fileKey: string) => {
    return this.getS3Instance()
      .deleteObject({
        Bucket: this.bucketName,
        Key: fileKey,
      })
      .promise();
  };

  getUrl = (fileKey: string) => {
    return this.getS3Instance().getSignedUrl('getObject', {
      Bucket: this.bucketName,
      key: fileKey,
    });
  };

  //#endregion
}
