import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cat } from './cat.model';
import { Options } from './options.model';

@Entity()
export class CatType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
  })
  name: string;

  @OneToOne(() => Cat, cat => cat.catType)
  cat: Cat;

  @Column(() => Options)
  options: Options;
}
