export interface SendPushNotification {
  pushToken: string;
  platform: string;
  title: string;
  body: string;
  data?: any;
}
