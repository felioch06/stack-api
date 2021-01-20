import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SystemCity } from './system-city.model';
import { Options } from './options.model';

@Entity()
export class SystemCountry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 2,
    unique: true,
  })
  countryCode: string;

  @Column({
    length: 70,
  })
  country: string;

  @Column({
    length: 4,
  })
  callingCode: string;

  @Column({
    length: 150,
  })
  flag: string;

  @Column()
  currency: string;

  @Column(() => Options)
  options: Options;

  @OneToMany(() => SystemCity, city => city.country)
  cities: SystemCity[];
}
