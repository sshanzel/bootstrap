import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { LoginDto, RegisterDto } from '@bootstrap/shared';
import { UserService } from '../user/user.service';
import type { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly users: UserService) {}

  async register(input: RegisterDto): Promise<User> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    return this.users.createLocalUser({ ...input, passwordHash });
  }

  async login(input: LoginDto): Promise<User> {
    const user = await this.users.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
