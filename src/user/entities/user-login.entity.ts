import { Transform } from 'class-transformer';
import { Moment } from 'moment';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DateTransformer } from '../../db/transformers/date.transformer';
import { User } from './user.entity';

@Entity('user_logins')
export class UserLogin {
  @PrimaryGeneratedColumn()
  public id: number;

  @Transform(({ value }) => value?.format() || null)
  @CreateDateColumn({ name: 'login_at', transformer: new DateTransformer() })
  loginAt: Moment;

  @ManyToOne(() => User, (user) => user.logins, { onDelete: 'CASCADE' })
  public user!: User;
}
