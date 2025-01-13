// src/locations/city.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Area } from './area.entity';
import { Order } from '../orders/order.entity';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => Area, (area) => area.city)
  areas: Area[];

  @OneToMany(() => Order, (order) => order.city)
  orders: Order[];
}
