import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Status } from '../enums/status.enum';

export class Options {
  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
