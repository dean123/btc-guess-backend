import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { PriceSnapshotsModule } from './price-snapshots/price-snapshots.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GuessesModule } from './guesses/guesses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    PriceSnapshotsModule,
    AuthModule,
    UsersModule,
    GuessesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
