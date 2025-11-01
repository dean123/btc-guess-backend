import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PriceSnapshotsService } from './price-snapshots.service';

interface BinanceResponse {
  price?: string;
}

@Injectable()
export class BitcoinPriceFetcherService {
  private readonly logger = new Logger(BitcoinPriceFetcherService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly priceSnapshotsService: PriceSnapshotsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async fetchAndStoreBitcoinPrice() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
        ),
      );

      const data = response.data as BinanceResponse;
      if (!data.price) {
        throw Error('Missing price value in Binance response');
      }

      const price = parseFloat(data.price);
      const timestamp = new Date().toISOString();

      this.logger.log(`Fetched Bitcoin price: $${price} at ${timestamp}`);

      await this.priceSnapshotsService.create({
        timestamp,
        price,
      });

      this.logger.log('Successfully stored price snapshot');
    } catch (error) {
      this.logger.error('Failed to fetch or store Bitcoin price', error);
    }
  }
}
