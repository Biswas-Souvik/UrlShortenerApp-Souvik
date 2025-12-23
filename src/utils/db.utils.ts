import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { PutItemResponse } from '../types';

const TABLE_NAME = process.env.TABLE_NAME;
const client = new DynamoDBClient();

console.log('DynamoDB Table Name:', TABLE_NAME);

export const getItem = async (shortId: string) => {
  try {
    const resp = await client.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          shortId: shortId,
        },
      })
    );
    return resp;
  } catch (error) {
    console.error('Error getting item from DynamoDB:', error);
    return { Item: null, message: 'Error retrieving item' };
  }
};

export const putItem = async (
  shortId: string,
  originalUrl: string
): Promise<PutItemResponse> => {
  try {
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          shortId: shortId,
          originalUrl: originalUrl,
        },
        // Prevent overwriting an existing shorturl
        ConditionExpression: 'attribute_not_exists(shortId)',
      })
    );
    return { status: 'success' };
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      // The shortId already exists
      return { status: 'keyAlreadyExists' };
    }
    console.error('Error putting item into DynamoDB:', error);
    return { status: 'error', message: error.message };
  }
};
