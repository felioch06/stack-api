/* eslint-disable no-console */
import argon from 'argon2';
import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import Container from 'typedi';
import { EntityTarget, getRepository, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { onboardingExceptions } from '../../api/exceptions';
import { ApiResponse } from '../../api/interfaces/api-response.interface';
import { BaseSettingNotification } from '../../api/interfaces/base-setting-notification.interface';
import { BaseToken } from '../../api/interfaces/base-token.interface';
import { BaseUser } from '../../api/interfaces/base-user.interface';
import { DisableAccountBody } from '../../api/interfaces/disable-account-body.interface';
import { LoginBody } from '../../api/interfaces/login-body.interface';
import { NotificationSettingBody } from '../../api/interfaces/notification-setting-body.interface';
import { ValidateCodeBody } from '../../api/interfaces/validate-code-body.interface';
import { VerifySmsBody } from '../../api/interfaces/verify-sms-body.interface';
import { Status } from '../../app/enums/status.enum';
import { appConfig } from '../../config/app';
import { awsConfig } from '../../config/aws';
import { mailConfig } from '../../config/mail';
import { AwsLib } from './aws';
import { FileHelper } from './file-helper';
import { Mailer } from './mailer';
import { Notifications } from './notifications';
import { createErrorResponse, createResponse } from './response';
import { generateAuthToken } from './token';

interface OnboardingModels<
  U extends BaseUser,
  T extends BaseToken,
  I extends BaseSettingNotification
> {
  user: EntityTarget<unknown | U>;
  userToken: EntityTarget<unknown | T>;
  userSettingNotification: EntityTarget<unknown | I>;
}

export const createOnboarding = <
  U extends BaseUser,
  T extends BaseToken,
  I extends BaseSettingNotification
>(
  models: OnboardingModels<U, T, I>,
  userColumn: string,
  modelName: string,
  mailer: Mailer,
  awsLib: AwsLib,
  fileHelper: FileHelper
) => {
  const generateCode = () => Math.floor(1000 + Math.random() * 9000);

  const getUserNotificationRepository = async (modelName: string) => {
    const userNotificationModel = (await import(
      `../../app/models/${modelName}-setting-notification.model`
    ).then(md => Object.values(md)[0])) as any;

    const userNotificationRepository = getRepository(userNotificationModel);

    return userNotificationRepository;
  };

  return {
    login: async (req: Request, body: LoginBody) => {
      const appconf = appConfig();

      const userRepository = getRepository(models.user);
      const user = (await userRepository.findOne({
        where: {
          [userColumn]: body.email,
        },
      })) as U;

      if (!user) {
        return createErrorResponse({
          httpStatusCode: 404,
          message: (req as any).lang.onboarding.user.notFound,
        }) as ApiResponse;
      }

      if (user.options.status !== Status.Active) {
        return createErrorResponse({
          httpStatusCode: 400,
          message: (req as any).lang.onboarding.user.inactive,
        });
      }

      if (user.type !== req.body.type) {
        return createErrorResponse({
          httpStatusCode: 403,
          message: (req as any).lang.onboarding.user.accountTypeMismatch,
        });
      }

      const passwordCheck = user.password === body.password;

      if (!passwordCheck) {
        return createErrorResponse({
          httpStatusCode: 403,
          message: (req as any).lang.onboarding.user.invalidCredentials,
        });
      }

      const authToken = generateAuthToken({
        id: user.id,
        modelName,
      });

      const tokenRepository = getRepository(models.userToken);
      if (appconf.multipleLogin) {
        await tokenRepository.save({
          authToken,
          lastUsed: new Date(),
          platform: req.body.platform,
          pushToken: req.body.pushToken,

          user: {
            id: user.id,
          },
          version: req.body.version,
        } as Partial<T>);
      } else {
        const token = (await tokenRepository.findOne({
          where: {
            user: {
              id: user.id,
            },
          },
        })) as T;

        if (token) {
          await tokenRepository.update(
            {
              id: token.id,
            },
            {
              authToken,
              pushToken: req.body.pushToken,
              lastUsed: new Date(),
              version: req.body.version,
            }
          );
        } else {
          await tokenRepository.save({
            authToken,
            pushToken: req.body.pushToken,
            lastUsed: new Date(),
            platform: req.body.platform,
            user,
            version: req.body.version,
          } as any);
        }
      }

      const userCopy = { ...user };
      delete userCopy.password;
      delete userCopy.options;

      return createResponse({
        data: {
          user: userCopy,
          authToken,
        },
        message: (req as any).lang.onboarding.user.loggedInUser,
      });
    },
    getProfile: async (req: Request) => {
      try {
        const userRepository = getRepository(models.user);

        const user = (await userRepository.findOne({
          where: {
            id: (req as any).user.id,
          },
        })) as U;

        const authToken = generateAuthToken({
          id: user.id,
          modelName,
        });

        delete user.password;
        delete user.options;

        return createResponse({
          data: {
            user,
            authToken,
          },
        });
      } catch (e) {
        console.error('Error in getProfile', e);
        return createErrorResponse({
          data: e,
          message: (req as any).lang.serverError,
        });
      }
    },
    createAccount: async (
      req: Request,
      user: Partial<U>,
      welcomeEmailTemplate?: string
    ): Promise<ApiResponse> => {
      try {
        const userRepository = getRepository(models.user);
        const appconf = appConfig();

        const existsUser = await userRepository.findOne({
          where: {
            [userColumn]: user[userColumn],
          },
        });

        if (existsUser) {
          return createErrorResponse({
            httpStatusCode: 400,
            message: (req as any).lang.onboarding.user.alreadyExists,
          });
        }

        user.id = uuidv4();

        const savedUser = await userRepository.save(user);

        if (welcomeEmailTemplate) {
          const mailconf = mailConfig();

          await mailer.sendMail({
            template: welcomeEmailTemplate,
            to: (user as any).email,
            from: mailconf.user,
            context: {
              user,
              app: appconf,
            },
          });
        }

        const authToken = generateAuthToken({
          id: savedUser.id,
          modelName,
        });

        delete savedUser.password;
        delete savedUser.options;

        return createResponse({
          httpStatusCode: 201,
          message: (req as any).lang.onboarding.user.created,
          data: {
            user,
            authToken,
          },
        });
      } catch (e) {
        console.error('Error in createAccount', e);
        return createErrorResponse({
          message: (req as any).lang.serverError,
          data: e,
        });
      }
    },
    sendVerifyEmail: async (req: Request, email: string, send = false) => {
      try {
        const userRepository = getRepository(models.user);
        const user = (await userRepository.findOne({
          where: {
            email,
          },
        })) as any;

        if (!user) {
          return createErrorResponse({
            httpStatusCode: 404,
            message: (req as any).lang.onboarding.user.email.notFound,
          });
        }

        if (user.options.status !== Status.Active) {
          return onboardingExceptions.userNotActiveException(req);
        }

        if (send) {
          const code = generateCode();

          await userRepository.update(
            {
              id: user.id,
            },
            {
              verificationCode: await argon.hash(code.toString()),
            }
          );

          const mailconf = mailConfig();

          await mailer.sendMail({
            from: mailconf.user,
            to: email,
            subject: 'Verificacion de correo',
            template: 'verify-email',
            context: {
              email,
              code,
            },
          });
        }

        return createResponse({
          message: (req as any).lang.onboarding.user.email.success,
        });
      } catch (e) {
        console.error('error in sendVerifyEmail', e);
        return createErrorResponse({
          data: e,
          message: (req as any).lang.serverError,
        });
      }
    },
    sendVerifyPhone: async (req: Request, body: VerifySmsBody) => {
      const userRepository = getRepository(models.user);

      const user = (await userRepository.findOne({
        where: {
          email: body.email,
        },
      })) as any;

      if (!user) {
        return createErrorResponse({
          httpStatusCode: 404,
          message: (req as any).lang.onboarding.user.email.notFound,
        });
      }

      if (user.options.status !== Status.Active) {
        return onboardingExceptions.userNotActiveException(req);
      }

      // if (send) {
      const code = generateCode();

      await userRepository.update(
        {
          id: user.id,
        },
        {
          verificationCode: await argon.hash(code.toString()),
        }
      );

      const awsInstance = new AwsLib();

      const existsResponse = await awsInstance.checkIfNumberExists(
        body.phoneNumber
      );
      if (existsResponse.code !== 100) {
        return createErrorResponse({
          httpStatusCode: 404,
          message: (req as any).lang.onboarding.user.sms.notExists,
        });
      }
      const snsMessage = `Su código de verificación es ${code}`;

      const messageResponse = await awsInstance.sendSMS(
        body.phoneNumber,
        snsMessage
      );

      if (messageResponse.code !== 100) {
        return createErrorResponse({
          httpStatusCode: 400,
          message: (req as any).lang.onboarding.user.sms.failed,
        });
      }

      return createResponse({
        message: (req as any).lang.onboarding.user.sms.success,
      });
    },
    validateCode: async (req: Request, body: ValidateCodeBody) => {
      try {
        const userRepository = getRepository(models.user);

        const user = (await userRepository.findOne({
          where: {
            [userColumn]: body.user,
          },
        })) as any;

        if (!user) {
          return onboardingExceptions.userNotFoundException(req);
        }

        if (user.options.status !== Status.Active) {
          return onboardingExceptions.userNotActiveException(req);
        }

        const validCode = await argon.verify(user.verificationCode, body.code);

        if (!validCode) {
          return createErrorResponse({
            httpStatusCode: 403,
            message: (req as any).lang.onboarding.user.invalidCode,
          });
        }

        await userRepository.update(
          {
            [userColumn]: body.user,
          },
          {
            verificationCode: '',
          }
        );

        return createResponse({
          data: {
            authToken: generateAuthToken({
              id: user.id,
              modelName,
            }),
          },
          message: (req as any).lang.onboarding.user.validCode,
        });
      } catch (e) {
        console.error('error in validateCode', e);
        return createErrorResponse({
          data: e,
          message: (req as any).lang.serverError,
        });
      }
    },
    updateNotificationSettings: async (
      req: Request,
      body: NotificationSettingBody
    ) => {
      try {
        const userNotificationRepository = await getUserNotificationRepository(
          (req as any).modelName
        );

        await userNotificationRepository.update(
          {
            user: {
              id: body.uid,
            },
          },
          {
            sms: body.sms,
            email: body.email,
            push: body.push,
          }
        );

        return createResponse({
          message: (req as any).lang.onboarding.user.notificationUpdateSuccess,
        });
      } catch (e) {
        console.error('error in updateNotificationSettings', e);
        return createErrorResponse({
          data: e,
          message: (req as any).lang.onboarding.user.notificationUpdateFailed,
        });
      }
    },
    sendPasswordRecoveryCode: async (req: Request, userValue: string) => {
      try {
        const userRepository = getRepository(models.user);

        const user = (await userRepository.findOne({
          where: {
            [userColumn]: userValue,
          },
        })) as U;

        if (!user) {
          return onboardingExceptions.userNotFoundException(req);
        }

        if (user.options.status !== Status.Active) {
          return onboardingExceptions.userNotActiveException(req);
        }

        const userNotificationRepository = getRepository(
          models.userSettingNotification
        );

        let notificationSettings = (await userNotificationRepository.findOne({
          where: {
            user: {
              id: user.id,
            },
          },
        })) as any;

        if (!notificationSettings) {
          notificationSettings = {} as I;
          await userNotificationRepository.insert({
            sms: false,
            email: true,
            push: false,
            user: {
              id: user.id,
            },
          });

          notificationSettings.email = true;
        }

        const code = generateCode();
        const message = `Su código de verificación es ${code}`;
        const notificationLibrary = Container.get(Notifications);

        await notificationLibrary.sendNotification({
          user,
          message,
          notificationSettingRepository: userNotificationRepository as Repository<I>,
          tokenRepository: getRepository(models.userToken) as Repository<T>,
          userRepository: userRepository as Repository<U>,
          mail: {
            subject: (req as any).lang.onboarding.passwordRecovery.emailSubject,
            template: 'verify-email',
            context: {
              email: user.email,
              code: code.toString(),
            },
          },
        });

        await userRepository.update(
          {
            id: user.id,
          },
          {
            verificationCode: await argon.hash(code.toString()),
          }
        );

        return createResponse({
          message: (req as any).lang.onboarding.passwordRecovery.codeSent,
        });
      } catch (e) {
        console.error('Error in sendPasswordRecoveryCode', e);
        return createErrorResponse({
          data: e,
          message: (req as any).lang.serverError,
        });
      }
    },

    setPassword: async (req: Request, password: string) => {
      try {
        const userRepository = await getRepository(models.user);

        const user = (await userRepository.findOne({
          where: {
            id: (req as any).user.id,
          },
        })) as any;

        if (!user) {
          return onboardingExceptions.userNotFoundException(req);
        }

        if (user.option.status !== Status.Active) {
          return onboardingExceptions.userNotActiveException(req);
        }

        await userRepository.update(
          {
            id: user.id,
          },
          {
            password,
          }
        );

        return createResponse({
          message: (req as any).lang.onboarding.passwordRecovery
            .passwordResetSuccess,
        });
      } catch (e) {
        console.error('Error in setPassword', e);
        return createErrorResponse({
          message: (req as any).lang.serverError,
          data: e,
        });
      }
    },

    uploadPhoto: async (req: Request): Promise<ApiResponse> => {
      try {
        const awsConf = awsConfig();
        if (!req.files || Object.keys(req.files).length === 0) {
          return createErrorResponse({
            httpStatusCode: 400,
            message: 'No files uploaded',
          });
        }

        const userRepository = getRepository(models.user);
        const user = (req as any).user as U;

        const file = req.files.file as UploadedFile;
        const fileName = fileHelper.getFileName(
          file,
          user.id,
          awsConf.usersFolder
        );

        if (user.photoUrl) {
          await awsLib.deleteFile(`${awsConf.usersFolder}/${user.photoUrl}`);
        }

        const awsPath = await awsLib.uploadFile(fileName, file.data);

        await userRepository.update(
          {
            id: user.id,
          },
          {
            photoUrl: awsPath,
          }
        );

        return createResponse({
          message: (req as any).lang.onboarding.user.photoUpdated,
        });
      } catch (e) {
        console.error('error in uploadPhoto', e);
        return createErrorResponse({
          message: (req as any).lang.serverError,
          data: e,
        });
      }
    },

    updateProfile: async (
      req: Request,
      profile: Partial<U>
    ): Promise<ApiResponse> => {
      try {
        const awsConf = awsConfig();
        const user = (req as any).user;
        const userRepository = getRepository(models.user);

        if (req.files && req.files.file) {
          const file = req.files.file as UploadedFile;
          const fileName = fileHelper.getFileName(
            file,
            user.id,
            awsConf.usersFolder
          );

          const awsPath = await awsLib.uploadFile(fileName, file.data);

          profile.photoUrl = awsPath;
        }

        await userRepository.update(
          {
            id: user.id,
          },
          profile
        );

        return createResponse({
          message: (req as any).lang.onboarding.user.profileUpdated,
        });
      } catch (e) {
        console.error('Error in updateProfile', e);
        return createErrorResponse({
          message: (req as any).lang.serverError,
        });
      }
    },

    disableAccount: async (
      req: Request,
      { userValue, password }: DisableAccountBody
    ) => {
      try {
        const userRepository = getRepository(models.user);
        const user = (req as any).user;

        if (userValue && userValue !== user[userValue]) {
          return createErrorResponse({
            httpStatusCode: 403,
            message: (req as any).lang.onboarding.user.invalidCredentials,
          });
        }

        if (password && password !== user.password) {
          return createErrorResponse({
            httpStatusCode: 403,
            message: (req as any).lang.onboarding.user.invalidCredentials,
          });
        }

        await userRepository.update(
          {
            id: user.id,
          },
          {
            options: {
              status: Status.Inactive,
            },
          }
        );

        return createErrorResponse({
          message: (req as any).lang.onboarding.user.disabledSuccess,
        });
      } catch (e) {
        console.error('Error in disableACcount', e);
        return createErrorResponse({
          data: e,
          message: (req as any).lang.serverError,
        });
      }
    },
  };
};
