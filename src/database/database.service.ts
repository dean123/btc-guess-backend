import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private docClient: DynamoDBDocumentClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const region = this.configService.get<string>('dynamodb.region');
    const endpoint = this.configService.get<string>('dynamodb.endpoint');

    const client = new DynamoDBClient({
      region,
      ...(endpoint && { endpoint }),
    });

    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async put(tableName: string, item: Record<string, any>) {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    return this.docClient.send(command);
  }

  async get(tableName: string, key: Record<string, any>) {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });
    const result = await this.docClient.send(command);
    return result.Item;
  }

  async update(
    tableName: string,
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, any>,
  ) {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });
    const result = await this.docClient.send(command);
    return result.Attributes;
  }

  async delete(tableName: string, key: Record<string, any>) {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });
    return this.docClient.send(command);
  }

  async query(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeNames?: Record<string, string>,
    expressionAttributeValues?: Record<string, any>,
    filterExpression?: string,
  ) {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      FilterExpression: filterExpression,
    });
    const result = await this.docClient.send(command);
    return result.Items || [];
  }

  async scan(
    tableName: string,
    filterExpression?: string,
    expressionAttributeNames?: Record<string, string>,
    expressionAttributeValues?: Record<string, any>,
  ) {
    const command = new ScanCommand({
      TableName: tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });
    const result = await this.docClient.send(command);
    return result.Items || [];
  }
}
