import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('block')
@Index(['fk_hater_id', 'fk_hated_id'], { unique: true })
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  fk_hater_id!: string;

  @Column('uuid')
  fk_hated_id!: string;

  @Index()
  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;
}
