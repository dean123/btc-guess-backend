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
  private tableName?: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const region = this.configService.get<string>('dynamodb.region');
    const endpoint = this.configService.get<string>('dynamodb.endpoint');
    this.tableName = this.configService.get<string>('dynamodb.tableName');

    const client = new DynamoDBClient({
      region,
      ...(endpoint && { endpoint }),
    });

    this.docClient = DynamoDBDocumentClient.from(client);
  }

  getTableName(): string | undefined {
    return this.tableName;
  }

  async put(item: Record<string, any>) {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });
    return this.docClient.send(command);
  }

  async get(key: Record<string, any>) {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: key,
    });
    const result = await this.docClient.send(command);
    return result.Item;
  }

  async update(
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, any>,
  ) {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });
    const result = await this.docClient.send(command);
    return result.Attributes;
  }

  async delete(key: Record<string, any>) {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: key,
    });
    return this.docClient.send(command);
  }

  async query(
    keyConditionExpression: string,
    expressionAttributeNames?: Record<string, string>,
    expressionAttributeValues?: Record<string, any>,
    filterExpression?: string,
  ) {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      FilterExpression: filterExpression,
    });
    const result = await this.docClient.send(command);
    return result.Items || [];
  }

  async scan(
    filterExpression?: string,
    expressionAttributeNames?: Record<string, string>,
    expressionAttributeValues?: Record<string, any>,
  ) {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });
    const result = await this.docClient.send(command);
    return result.Items || [];
  }
}
