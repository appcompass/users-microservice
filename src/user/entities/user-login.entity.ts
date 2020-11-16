import { Transform } from 'class-transformer';
import { Moment } from 'moment';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DateTransformer } from '../../db/transformers/date.transformer';
import { User } from './user.entity';

@Entity({ schema: 'users', name: 'user_logins' })
export class UserLogin {
  @PrimaryGeneratedColumn()
  public id: number;

  @Transform((loginAt) => loginAt?.format() || null)
  @CreateDateColumn({ name: 'login_at', transformer: new DateTransformer() })
  loginAt: Moment;

  @ManyToOne(() => User, (user) => user.logins, { onDelete: 'CASCADE' })
  public user!: User;
}
