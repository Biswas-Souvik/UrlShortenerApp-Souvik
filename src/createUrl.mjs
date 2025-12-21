import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

const TABLE_NAME = process.env.TABLE_NAME;
const client = new DynamoDBClient();

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const originalUrl = body?.url;

    if (!originalUrl) {
      return { statusCode: 400, body: 'URL is required' };
    }

    const shortId = crypto.randomBytes(4).toString('hex');
    console.log('Generated shortId:', shortId);
    console.log('Original URL to store:', originalUrl);
    console.log('DynamoDB Table Name:', TABLE_NAME);

    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          shortId: shortId,
          originalUrl: originalUrl,
        },
      })
    );

    const baseUrl = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
    const shortUrl = `${baseUrl}/short/${shortId}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ shortUrl }),
    };
  } catch (error) {
    console.error('Error creating short URL:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
