import { Controller, Get } from '@nestjs/common';
import { PriceSnapshotsService } from './price-snapshots.service';

@Controller('price-snapshots')
export class PriceSnapshotsController {
  constructor(private readonly priceSnapshotsService: PriceSnapshotsService) {}

  @Get()
  findAll() {
    return this.priceSnapshotsService.findAll();
  }

  @Get('latest')
  findLatest() {
    return this.priceSnapshotsService.findLatest();
  }
}
