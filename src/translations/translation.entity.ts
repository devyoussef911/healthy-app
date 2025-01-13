import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Translation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string; // Translation key (e.g., 'product.name')

  @Column('jsonb')
  values: Record<string, string>; // Translations for each language (e.g., { en: 'Name', ar: 'الاسم' })
}
