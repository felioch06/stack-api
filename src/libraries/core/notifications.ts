import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { BaseSettingNotification } from '../../api/interfaces/base-setting-notification.interface';
import { BaseToken } from '../../api/interfaces/base-token.interface';
import { BaseUser } from '../../api/interfaces/base-user.interface';
import { SystemCity } from '../../app/models/system-city.model';
import { mailConfig } from '../../config/mail';
import { AwsLib } from './aws';
import { Mailer } from './mailer';
import { PushNotification } from './push-notifications';

export interface NotificationOptions<U, T, N> {
  user: U;
  userRepository: Repository<U>;
  tokenRepository: Repository<T>;
  notificationSettingRepository: Repository<N>;
  message: string;
  mail?: {
    template: string;
    subject: string;
    context?: {
      [key: string]: string;
    };
  };
}

@Service()
export class Notifications {
  constructor(
    public mailer: Mailer,
    public pushNotification: PushNotification,
    public awsLib: AwsLib
  ) {}

  sendNotification = async <
    U extends BaseUser,
    T extends BaseToken,
    N extends BaseSettingNotification
  >(
    notificationOptions: NotificationOptions<U, T, N>
  ) => {
    try {
      const notificationSettings = await notificationOptions.notificationSettingRepository.findOne(
        {
          where: {
            user: {
              id: notificationOptions.user.id,
            },
          },
        }
      );
      if (notificationSettings.email) {
        const mailconf = mailConfig();

        await this.mailer.sendMail({
          from: mailconf.user,
          to: notificationOptions.user.email,
          subject: notificationOptions.mail.subject,
          template: notificationOptions.mail.template,
          context: notificationOptions.mail.context,
        });
      }

      if (notificationSettings.sms) {
        const userPhoneNumber = (notificationOptions.user as any).phone;
        if (!userPhoneNumber) {
          // eslint-disable-next-line no-console
          console.log('User has not registered a phone number');
        } else {
          try {
            const userSystemCity = (await notificationOptions.userRepository.findOne(
              {
                where: {
                  id: notificationOptions.user.id,
                },
                relations: ['city', 'city.country'],
              }
            )) as any;

            const countryCode = (userSystemCity.city as SystemCity).country
              .callingCode;

            const fullNumber = `${countryCode}${userPhoneNumber}`;

            await this.awsLib.sendSMS(fullNumber, notificationOptions.message);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error sending sms to user. Cause: ', e);
          }
        }
      }

      if (notificationSettings.push) {
        const tokens = (await notificationOptions.tokenRepository.find({
          where: {
            user: {
              id: notificationOptions.user.id,
            },
          },
        })) as T[];

        for (const token of tokens) {
          await this.pushNotification.sendPushNotification({
            body: notificationOptions.message,
            pushToken: token.pushToken,
            platform: token.platform,
            title: notificationOptions.mail.subject,
          });
        }
      }

      return {
        status: true,
        message: 'Notification sent',
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error sending notification', e);
      return {
        status: false,
        data: e,
      };
    }
  };
}
