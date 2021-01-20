import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SystemCountry } from './system-country.model';
import { Options } from './options.model';

@Entity()
export class SystemCity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
  })
  name: string;

  @Column(() => Options)
  options: Options;

  @ManyToOne(_ => SystemCountry, country => country.cities, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  country: SystemCountry;
}
