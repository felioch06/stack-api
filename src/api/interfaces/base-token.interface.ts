import { Platform } from '../../app/enums/platform.enum';
import { Options } from '../../app/models/options.model';
import { BaseUser } from './base-user.interface';

export interface BaseToken {
  id: number;

  pushToken: string;

  authToken: string;

  user: BaseUser;

  platform: Platform;

  lastUsed: Date;

  version: string;

  options: Options;
}
