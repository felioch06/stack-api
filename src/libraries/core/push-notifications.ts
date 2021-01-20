import { SendPushNotification } from '../../api/interfaces/send-push-notification.interface';
import * as firebaseCreds from '../../credentials/firebase.json';
import * as admin from 'firebase-admin';
import { Service } from 'typedi';

const HIGH_PRIORITY = 'high';
const FLUTTER_NOTIFICATION_CLICK = 'FLUTTER_NOTIFICATION_CLICK';

@Service()
export class PushNotification {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseCreds as any),
    });
  }

  sendPushNotification = async (options: SendPushNotification) => {
    try {
      const message = {
        token: options.pushToken,
        notification: {
          title: options.title,
          body: options.body,
        },
      } as any;

      const dataSize = Object.keys(options.data || {}).length;

      message.android = {
        priority: HIGH_PRIORITY,
      };

      if (dataSize > 0) {
        message.data = options.data;

        // eslint-disable-next-line camelcase
        message.data.click_action = FLUTTER_NOTIFICATION_CLICK;
      }

      const messageResult = await admin.messaging().send(message);

      return {
        code: 100,
        data: messageResult,
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Error sending notification message', e);
      return {
        code: 102,
        data: e,
      };
    }
  };
}
