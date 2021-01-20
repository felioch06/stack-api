import { Platform } from '../../app/enums/platform.enum';

export interface LoginBody {
  email: string;
  password: string;
  platform: Platform;
  pushToken: string;
  version: string;
}
