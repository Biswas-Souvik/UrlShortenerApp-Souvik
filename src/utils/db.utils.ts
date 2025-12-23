import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

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

export const putItem = async (shortId: string, originalUrl: string) => {
  try {
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          shortId: shortId,
          originalUrl: originalUrl,
        },
      })
    );
    return true;
  } catch (error) {
    console.error('Error putting item into DynamoDB:', error);
    return false;
  }
};
