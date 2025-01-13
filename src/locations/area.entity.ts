// src/locations/area.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { City } from './city.entity';
import { Order } from '../orders/order.entity';

@Entity()
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => City, (city) => city.areas)
  city: City;

  @OneToMany(() => Order, (order) => order.area)
  orders: Order[];
}
