import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('follow')
@Index(['fk_leader_id', 'fk_follower_id'], { unique: true })
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  fk_leader_id!: string;

  @Column('uuid')
  fk_follower_id!: string;

  @Index()
  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', cascade: true, eager: true })
  @JoinColumn({ name: 'fk_leader_id' })
  user!: User;
}
