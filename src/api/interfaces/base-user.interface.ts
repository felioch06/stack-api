import { AccountType } from '../../app/enums/account-type.enum';
import { Options } from '../../app/models/options.model';
import { BaseToken } from './base-token.interface';

export interface BaseUser {
  photoUrl: string;

  password: string;

  email: string;

  id: string;

  tokens: BaseToken[];

  notificationSettings: any;

  verificationCode: string;

  type: AccountType;

  options: Options;
}
