import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PriceSnapshotsService } from './price-snapshots.service';
import { GuessesService } from '../guesses/guesses.service';
import { GuessDirection } from '../guesses/entities/guess-direction.enum';

interface BinanceResponse {
  price?: string;
}

@Injectable()
export class BitcoinPriceFetcherService {
  private readonly logger = new Logger(BitcoinPriceFetcherService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly priceSnapshotsService: PriceSnapshotsService,
    private readonly guessesService: GuessesService,
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

      await this.resolveGuesses(price);
    } catch (error) {
      this.logger.error('Failed to fetch or store Bitcoin price', error);
    }
  }

  private async resolveGuesses(currentPrice: number) {
    try {
      const unresolvedGuesses = await this.guessesService.findUnresolved();
      this.logger.log(`Found ${unresolvedGuesses.length} unresolved guesses`);

      for (const guess of unresolvedGuesses) {
        const priceSnapshot = await this.priceSnapshotsService.findOne(
          guess.priceSnapshotId,
        );

        if (!priceSnapshot) {
          this.logger.warn(
            `Price snapshot ${guess.priceSnapshotId} not found for guess ${guess.id}`,
          );
          continue;
        }

        const priceWentUp = currentPrice > priceSnapshot.price;
        const isCorrect =
          (guess.direction === GuessDirection.UP && priceWentUp) ||
          (guess.direction === GuessDirection.DOWN && !priceWentUp);

        await this.guessesService.resolveGuess(guess.id, isCorrect);
        this.logger.log(
          `Resolved guess ${guess.id}: ${isCorrect ? 'correct' : 'incorrect'}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to resolve guesses', error);
    }
  }
}
