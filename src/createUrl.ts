import { ShortUrlEvent, ShortUrlEventBody } from './types';
import { createUrlResponse } from './utils/url.utils';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

const TABLE_NAME = process.env.TABLE_NAME;
const client = new DynamoDBClient();

export const handler = async (event: ShortUrlEvent) => {
  try {
    const body: ShortUrlEventBody = JSON.parse(event.body);
    const originalUrl = body?.url;

    if (!originalUrl) {
      return { statusCode: 400, body: 'URL is required' };
    }

    const shortId = crypto.randomBytes(4).toString('hex');

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

    return createUrlResponse(201, JSON.stringify({ shortUrl }));
  } catch (error) {
    console.error('Error creating short URL:', error);
    return createUrlResponse(500, 'Internal Server Error');
  }
};
