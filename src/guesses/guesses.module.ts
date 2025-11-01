import { Module } from '@nestjs/common';
import { GuessesController } from './guesses.controller';
import { GuessesService } from './guesses.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GuessesController],
  providers: [GuessesService],
  exports: [GuessesService],
})
export class GuessesModule {}
