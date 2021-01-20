export interface NotificationSettingBody {
  uid?: string;
  sms?: boolean;
  email: boolean;
  push?: boolean;
}
