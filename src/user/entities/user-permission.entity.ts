import { Transform } from 'class-transformer';
import { Moment } from 'moment';
import { DateTransformer } from 'src/db/transformers/date.transformer';
import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('user_permission')
export class UserPermission {
  @PrimaryColumn()
  public userId: number;

  @PrimaryColumn()
  public permissionId: number;

  @Transform(created => created?.format() || null)
  @CreateDateColumn({ transformer: new DateTransformer() })
  createdAt: Moment;

  @Transform(updated => updated?.format() || null)
  @UpdateDateColumn({ transformer: new DateTransformer() })
  updatedAt: Moment;

  @ManyToOne(
    () => User,
    user => user.userToPermissions,
    { onDelete: 'CASCADE' }
  )
  public user!: User;

  @ManyToOne(
    () => Permission,
    permission => permission.permissionToUsers,
    { onDelete: 'CASCADE' }
  )
  public permission!: Permission;
}
