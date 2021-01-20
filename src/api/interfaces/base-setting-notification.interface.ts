import { Options } from '../../app/models/options.model';
import { BaseUser } from './base-user.interface';

export interface BaseSettingNotification {
  id: number;

  user: BaseUser;

  sms: boolean;

  push: boolean;

  email: boolean;

  options: Options;
}
