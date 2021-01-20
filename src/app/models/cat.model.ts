import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { CatType } from './cat-type.model';
import { Options } from './options.model';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
  })
  name: string;

  @OneToOne(() => CatType, cat => cat.id)
  @JoinColumn()
  catType: CatType;

  @Column(() => Options)
  options: Options;
}
