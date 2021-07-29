import { Transform } from 'class-transformer';
import { Moment } from 'moment';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { DateTransformer } from '../../db/transformers/date.transformer';
import { User } from './user.entity';

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({
    type: 'varchar',
    unique: true,
    length: 64
  })
  code: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  used: boolean;

  @Transform(({ value }) => value?.format() || null)
  @CreateDateColumn({ transformer: new DateTransformer() })
  createdAt: Moment;

  @Transform(({ value }) => value?.format() || null)
  @UpdateDateColumn({ transformer: new DateTransformer() })
  updatedAt: Moment;

  @ManyToOne(() => User, (user) => user.passwordResets, { onDelete: 'CASCADE' })
  user!: User;
}
