import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseSettingNotification } from '../../api/interfaces/base-setting-notification.interface';
import { Options } from './options.model';
import { User } from './user.model';

@Entity()
export class UserSettingNotification implements BaseSettingNotification {
  @PrimaryGeneratedColumn()
  id: number;
  
  @OneToOne(() => User, user => user.notificationSettings, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @Column({
    type: 'boolean',
  })
  sms: boolean;

  @Column({
    type: 'boolean',
  })
  push: boolean;

  @Column({
    type: 'boolean',
  })
  email: boolean;

  @Column(() => Options)
  options: Options;
}
