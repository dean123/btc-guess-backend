import { registerAs } from '@nestjs/config';

export default registerAs('dynamodb', () => ({
  region: process.env.AWS_REGION || 'eu-central-1',
  endpoint: process.env.DYNAMODB_ENDPOINT, // For local development
  tableName: process.env.DYNAMODB_TABLE || 'price-snapshots',
}));
