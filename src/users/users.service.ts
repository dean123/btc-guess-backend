import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  private readonly tableName: string;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('dynamodb.usersTable') || 'fallback';
  }

  async create(
    createUserDto: CreateUserDto,
    hashedPassword: string,
  ): Promise<User> {
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user: User = {
      id: randomUUID(),
      username: createUserDto.username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await this.databaseService.put(this.tableName, user);
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const result = await this.databaseService.scan(
        this.tableName,
        'username = :username',
        undefined,
        {
          ':username': username,
        },
      );

      if (result && result.length > 0) {
        return result[0] as User;
      }
      return null;
    } catch {
      return null;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const result = await this.databaseService.get(this.tableName, { id });
      return result as User | null;
    } catch {
      return null;
    }
  }
}
