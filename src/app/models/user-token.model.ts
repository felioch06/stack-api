import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseToken } from '../../api/interfaces/base-token.interface';
import { Platform } from '../enums/platform.enum';
import { Options } from './options.model';
import { User } from './user.model';

@Entity()
export class UserToken implements BaseToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pushToken: string;

  @Column()
  authToken: string;

  @Column({
    length: 50,
  })
  version: string;

  @ManyToOne(() => User, user => user.tokens, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @Column({
    type: 'enum',
    enum: Platform,
  })
  platform: Platform;

  @Column()
  lastUsed: Date;

  @Column(() => Options)
  options: Options;
}
