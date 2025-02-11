import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  id: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Category name', example: 'Electronics' })
  name: string;

  @Column({ nullable: true })
  @IsString()
  @ApiProperty({
    description: 'Optional description',
    example: 'Devices and gadgets',
    nullable: true,
  })
  description?: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @ApiProperty({ description: 'Parent category', nullable: true })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  @ApiProperty({ description: 'Child categories', type: () => [Category] })
  children: Category[];

  @OneToMany(() => Product, (product) => product.category)
  @ApiProperty({
    description: 'Products belonging to this category',
    type: () => [Product],
  })
  products: Product[];

  // Soft deletion column
  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the category was soft-deleted',
    nullable: true,
  })
  deletedAt?: Date;
}
