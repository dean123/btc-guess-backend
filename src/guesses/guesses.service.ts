import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { Guess } from './entities/guess.entity';
import { CreateGuessDto } from './dto/create-guess.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class GuessesService {
  private readonly tableName: string;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('dynamodb.guessesTable') || 'fallback';
  }

  async create(createGuessDto: CreateGuessDto, userId: string): Promise<Guess> {
    const guess: Guess = {
      id: randomUUID(),
      userId,
      priceSnapshotId: createGuessDto.priceSnapshotId,
      direction: createGuessDto.direction,
      isCorrect: null,
      createdAt: new Date().toISOString(),
    };

    await this.databaseService.put(this.tableName, guess);
    return guess;
  }

  async findAll(): Promise<Guess[]> {
    const items = await this.databaseService.scan(this.tableName);
    return items as Guess[];
  }

  async findByUserId(userId: string): Promise<Guess[]> {
    const result = await this.databaseService.scan(
      this.tableName,
      'userId = :userId',
      undefined,
      {
        ':userId': userId,
      },
    );
    return result as Guess[];
  }
}
