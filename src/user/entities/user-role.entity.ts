import { Transform } from 'class-transformer';
import { Moment } from 'moment';
import { DateTransformer } from 'src/db/transformers/date.transformer';
import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { Role } from './role.entity';
import { User } from './user.entity';

@Entity('user_role')
export class UserRole {
  @PrimaryColumn()
  public userId: number;

  @PrimaryColumn()
  public roleId: number;

  @Transform((created) => created?.format() || null)
  @CreateDateColumn({ transformer: new DateTransformer() })
  createdAt: Moment;

  @Transform((updated) => updated?.format() || null)
  @UpdateDateColumn({ transformer: new DateTransformer() })
  updatedAt: Moment;

  @ManyToOne(() => User, (user) => user.userToRoles, { onDelete: 'CASCADE' })
  public user!: User;

  @ManyToOne(() => Role, (role) => role.roleToUsers, { onDelete: 'CASCADE' })
  public role!: Role;
}
