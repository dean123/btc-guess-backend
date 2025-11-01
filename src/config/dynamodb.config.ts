import { registerAs } from '@nestjs/config';

export default registerAs('dynamodb', () => ({
  region: process.env.AWS_REGION || 'eu-central-1',
  endpoint: process.env.DYNAMODB_ENDPOINT, // For local development
  priceSnapshotsTable:
    process.env.DYNAMODB_PRICE_SNAPSHOTS_TABLE || 'price-snapshots',
  usersTable: process.env.DYNAMODB_USERS_TABLE || 'users',
  guessesTable: process.env.DYNAMODB_GUESSES_TABLE || 'guesses',
}));
