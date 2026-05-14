import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import type { User } from '../user/user.entity';
import { generateId } from '../common/id';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'text' })
  userId: string;

  @ManyToOne('User', 'refreshTokens', { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  assignId(): void {
    if (!this.id) {
      this.id = generateId();
    }
  }
}
