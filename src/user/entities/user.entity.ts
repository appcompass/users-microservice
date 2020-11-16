import { Exclude, Transform } from 'class-transformer';
import { Moment } from 'moment';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { DateTransformer } from '../../db/transformers/date.transformer';
import { UserLogin } from './user-login.entity';

@Entity({ schema: 'users', name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 64,
    unique: true,
    nullable: false
  })
  public email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: false })
  public password: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  public active: boolean;

  @Exclude()
  @Column({ type: 'varchar', length: 64 })
  public activationCode: string;

  @Transform((activatedAt) => activatedAt?.format() || null)
  @Column({
    type: 'timestamp',
    nullable: true,
    transformer: new DateTransformer()
  })
  public activatedAt: Moment;

  @Transform((lastLogin) => lastLogin?.format() || null)
  @Column({
    type: 'timestamp',
    nullable: true,
    transformer: new DateTransformer()
  })
  public lastLogin: Moment;

  @Exclude()
  @Column({
    type: 'timestamp',
    nullable: true,
    transformer: new DateTransformer()
  })
  public tokenExpiration: Moment;

  @Transform((created) => created?.format() || null)
  @CreateDateColumn({ transformer: new DateTransformer() })
  createdAt: Moment;

  @Transform((updated) => updated?.format() || null)
  @UpdateDateColumn({ transformer: new DateTransformer() })
  updatedAt: Moment;

  @OneToMany(() => UserLogin, (logins) => logins.user)
  public logins: UserLogin[];
}
