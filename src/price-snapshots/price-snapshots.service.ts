import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PriceSnapshot } from './entities/price-snapshot.entity';
import { CreatePriceSnapshotDto } from './dto/create-price-snapshot.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PriceSnapshotsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createPriceSnapshotDto: CreatePriceSnapshotDto,
  ): Promise<PriceSnapshot> {
    const priceSnapshot: PriceSnapshot = {
      id: randomUUID(),
      timestamp: createPriceSnapshotDto.timestamp,
      price: createPriceSnapshotDto.price,
      createdAt: new Date().toISOString(),
    };

    await this.databaseService.put(priceSnapshot);
    return priceSnapshot;
  }

  async findAll(): Promise<PriceSnapshot[]> {
    const items = await this.databaseService.scan();
    return items as PriceSnapshot[];
  }

  async findOne(id: string): Promise<PriceSnapshot | null> {
    const item = await this.databaseService.get({ id });
    return item as PriceSnapshot | null;
  }

  async findLatest(): Promise<PriceSnapshot | null> {
    const items = await this.databaseService.scan();
    if (items.length === 0) return null;

    const sorted = (items as PriceSnapshot[]).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return sorted[0];
  }
}
