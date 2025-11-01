import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { PriceSnapshot } from './entities/price-snapshot.entity';
import { CreatePriceSnapshotDto } from './dto/create-price-snapshot.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PriceSnapshotsService {
  private readonly tableName: string;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('dynamodb.priceSnapshotsTable') ||
      'fallback';
  }

  async create(
    createPriceSnapshotDto: CreatePriceSnapshotDto,
  ): Promise<PriceSnapshot> {
    const priceSnapshot: PriceSnapshot = {
      id: randomUUID(),
      timestamp: createPriceSnapshotDto.timestamp,
      price: createPriceSnapshotDto.price,
      createdAt: new Date().toISOString(),
    };

    await this.databaseService.put(this.tableName, priceSnapshot);
    return priceSnapshot;
  }

  async findAll(): Promise<PriceSnapshot[]> {
    const items = await this.databaseService.scan(this.tableName);
    return items as PriceSnapshot[];
  }

  async findOne(id: string): Promise<PriceSnapshot | null> {
    const item = await this.databaseService.get(this.tableName, { id });
    return item as PriceSnapshot | null;
  }

  async findLatest(): Promise<PriceSnapshot | null> {
    const items = await this.databaseService.scan(this.tableName);
    if (items.length === 0) return null;

    const sorted = (items as PriceSnapshot[]).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return sorted[0];
  }
}
