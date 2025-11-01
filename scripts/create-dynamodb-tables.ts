import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  CreateTableCommand,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const region = process.env.AWS_REGION || 'eu-central-1';
const endpoint = process.env.DYNAMODB_ENDPOINT;
const priceSnapshotsTable =
  process.env.DYNAMODB_PRICE_SNAPSHOTS_TABLE || 'price-snapshots';
const usersTable = process.env.DYNAMODB_USERS_TABLE || 'users';
const guessesTable = process.env.DYNAMODB_GUESSES_TABLE || 'guesses';

const client = new DynamoDBClient({
  region,
  ...(endpoint && { endpoint }),
});

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createTable(
  tableName: string,
  description: string,
): Promise<void> {
  const exists = await tableExists(tableName);

  if (exists) {
    console.log(`✓ Table "${tableName}" already exists`);
    return;
  }

  console.log(`Creating table "${tableName}"...`);

  const command = new CreateTableCommand({
    TableName: tableName,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST', // On-demand billing
  });

  try {
    await client.send(command);
    console.log(`✓ Table "${tableName}" created successfully (${description})`);
  } catch (error: any) {
    console.error(`✗ Failed to create table "${tableName}":`, error.message);
    throw error;
  }
}

async function main() {
  console.log('DynamoDB Table Creation Script');
  console.log('================================');
  console.log(`Region: ${region}`);
  console.log(`Endpoint: ${endpoint || 'AWS Default'}`);
  console.log('');

  try {
    await createTable(priceSnapshotsTable, 'Bitcoin price snapshots');
    await createTable(usersTable, 'Application users');
    await createTable(guessesTable, 'User guesses');
    console.log('');
    console.log('✓ All tables ready!');
  } catch (error) {
    console.error('');
    console.error('✗ Table creation failed');
    process.exit(1);
  }
}

main();
