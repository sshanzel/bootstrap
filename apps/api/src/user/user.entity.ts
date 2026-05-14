import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { RefreshToken } from '../auth/refresh-token.entity';
import { generateId } from '../common/id';

export type AuthProvider = 'local' | 'google';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ nullable: true, type: 'text' })
  firstName: string | null;

  @Column({ nullable: true, type: 'text' })
  lastName: string | null;

  @Column({ nullable: true, type: 'text' })
  passwordHash: string | null;

  @Column({ default: 'local', type: 'text' })
  authProvider: AuthProvider;

  @Column({ nullable: true, type: 'text', unique: true })
  googleId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('RefreshToken', 'user')
  refreshTokens: RefreshToken[];

  @BeforeInsert()
  assignId(): void {
    if (!this.id) {
      this.id = generateId();
    }
  }
}
