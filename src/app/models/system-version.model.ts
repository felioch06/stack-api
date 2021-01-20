import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Platform } from '../enums/platform.enum';
import { Options } from './options.model';

@Entity()
export class SystemVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Platform,
  })
  platform: Platform;

  @Column({
    length: 50,
    nullable: false,
    default: '1.0.0-1',
  })
  version: string;

  @Column({ default: 0 })
  flag: number;

  @Column(() => Options)
  options: Options;
}
