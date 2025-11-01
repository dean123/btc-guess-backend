import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PriceSnapshotsService } from './price-snapshots.service';
import { PriceSnapshotsController } from './price-snapshots.controller';
import { BitcoinPriceFetcherService } from './bitcoin-price-fetcher.service';
import { GuessesModule } from '../guesses/guesses.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [HttpModule, GuessesModule, UsersModule],
  controllers: [PriceSnapshotsController],
  providers: [PriceSnapshotsService, BitcoinPriceFetcherService],
  exports: [PriceSnapshotsService],
})
export class PriceSnapshotsModule {}
