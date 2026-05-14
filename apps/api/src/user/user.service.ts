import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { RegisterDto } from '@bootstrap/shared';
import { User } from './user.entity';

interface GoogleProfileInput {
  email: string;
  googleId: string;
  firstName?: string | null;
  lastName?: string | null;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  createLocalUser(
    input: RegisterDto & { passwordHash: string },
  ): Promise<User> {
    const user = this.userRepository.create({
      email: input.email.toLowerCase(),
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      passwordHash: input.passwordHash,
      authProvider: 'local',
    });
    return this.userRepository.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findOrCreateGoogleUser(input: GoogleProfileInput): Promise<User> {
    const existingByGoogleId = await this.userRepository.findOne({
      where: { googleId: input.googleId },
    });
    if (existingByGoogleId) {
      return existingByGoogleId;
    }

    const existingByEmail = await this.findByEmail(input.email);
    if (existingByEmail) {
      existingByEmail.googleId = input.googleId;
      existingByEmail.authProvider = 'google';
      existingByEmail.firstName =
        existingByEmail.firstName ?? input.firstName ?? null;
      existingByEmail.lastName =
        existingByEmail.lastName ?? input.lastName ?? null;
      return this.userRepository.save(existingByEmail);
    }

    const user = this.userRepository.create({
      email: input.email.toLowerCase(),
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      authProvider: 'google',
      googleId: input.googleId,
      passwordHash: null,
    });
    return this.userRepository.save(user);
  }
}
