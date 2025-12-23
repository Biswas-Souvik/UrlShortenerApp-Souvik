import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { PutItemResponse, GetByOriginalUrlResponse } from '../types';

const ORIGINAL_URL_INDEX = process.env.ORIGINAL_URL_INDEX;
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

export const getByOriginalUrl = async (
  originalUrl: string
): Promise<GetByOriginalUrlResponse> => {
  try {
    const response = await client.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: ORIGINAL_URL_INDEX,
        KeyConditionExpression: 'originalUrl = :url',
        ExpressionAttributeValues: {
          ':url': originalUrl,
        },
        Limit: 1, // we only expect at most one shortId per original URL
      })
    );

    return { error: false, item: response.Items?.[0] ?? null };
  } catch (error) {
    console.error('Error querying by originalUrl:', error);
    return { error: true, item: null };
  }
};
