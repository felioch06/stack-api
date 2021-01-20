import { Request, Response } from 'express';
import { Service } from 'typedi';
import { DisableAccountBody } from '../../../api/interfaces/disable-account-body.interface';
import { NotificationSettingBody } from '../../../api/interfaces/notification-setting-body.interface';
import { ValidateCodeBody } from '../../../api/interfaces/validate-code-body.interface';
import { VerifySmsBody } from '../../../api/interfaces/verify-sms-body.interface';
import { FileUploadBody } from '../../../api/interfaces/file-upload-body.interface';
import { AwsLib } from '../../../libraries/core/aws';
import { FileHelper } from '../../../libraries/core/file-helper';
import { Mailer } from '../../../libraries/core/mailer';
import { createOnboarding } from '../../../libraries/core/onboarding';
import { PushNotification } from '../../../libraries/core/push-notifications';
import { controllerResponse } from '../../../libraries/core/response';
import { UserSettingNotification } from '../../models/user-setting-notification.model';
import { UserToken } from '../../models/user-token.model';
import { User } from '../../models/user.model';
import { LoginBody } from '../../../api/interfaces/login-body.interface';

@Service()
export class OnboardingController {
  private onboarding: any;

  constructor(
    private mailer: Mailer,
    private awsLib: AwsLib,
    private fileHelper: FileHelper,
    private pushNotification: PushNotification
  ) {
    this.onboarding = createOnboarding(
      {
        user: User,
        userToken: UserToken,
        userSettingNotification: UserSettingNotification,
      },
      'email',
      User.name.toLowerCase(),
      this.mailer,
      this.awsLib,
      this.fileHelper
    );
  }

  login = async (req: Request, res: Response) => {
    const result = await this.onboarding.login(req, req.body as LoginBody);

    return controllerResponse(result, res);
  };

  createAccount = async (req: Request, res: Response) => {
    const result = await this.onboarding.createAccount(req, req.body as User);
    return controllerResponse(result, res);
  };

  sendPasswordRecoveryCode = async (req: Request, res: Response) => {
    const result = await this.onboarding.sendPasswordRecoveryCode(
      req,
      req.body.user as string
    );

    return controllerResponse(result, res);
  };

  getProfile = async (req: Request, res: Response) => {
    const result = await this.onboarding.getProfile(req);

    return controllerResponse(result, res);
  };

  sendVerifyEmail = async (req: Request, res: Response) => {
    const result = await this.onboarding.sendVerifyEmail(
      req,
      req.body.email as string,
      true
    );

    return controllerResponse(result, res);
  };

  sendVerifySms = async (req: Request, res: Response) => {
    const body = req.body as VerifySmsBody;
    const result = await this.onboarding.sendVerifyPhone(req, body);

    return controllerResponse(result, res);
  };

  validateVerificationCode = async (req: Request, res: Response) => {
    const body = req.body as ValidateCodeBody;
    const result = await this.onboarding.validateCode(req, body);

    return controllerResponse(result, res);
  };

  updateNotificationSettings = async (req: Request, res: Response) => {
    const result = await this.onboarding.updateNotificationSettings(
      req,
      req.body as NotificationSettingBody
    );

    return controllerResponse(result, res);
  };

  uploadPhoto = async (req: Request, res: Response) => {
    const result = await this.onboarding.uploadPhoto(req as FileUploadBody);

    return controllerResponse(result, res);
  };

  updateProfile = async (req: Request, res: Response) => {
    const result = await this.onboarding.updateProfile(
      req,
      req.body as Partial<User>
    );

    return controllerResponse(result, res);
  };

  updatePassword = async (req: Request, res: Response) => {
    const result = await this.onboarding.setPassword(req, req.body.password);

    return controllerResponse(result, res);
  };

  disableAccount = async (req: Request, res: Response) => {
    const result = await this.onboarding.disableAccount(
      req,
      req.body as DisableAccountBody
    );

    return controllerResponse(result, res);
  };
}
