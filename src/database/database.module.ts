import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import dynamodbConfig from '../config/dynamodb.config';

@Global() // Makes DatabaseService available everywhere
@Module({
  imports: [ConfigModule.forFeature(dynamodbConfig)],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
