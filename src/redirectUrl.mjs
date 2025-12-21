import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME;
const client = new DynamoDBClient();

export const handler = async (event) => {
  try {
    const shortId = event.pathParameters?.shortId;

    if (!shortId) {
      return { statusCode: 400, body: 'Short ID is required' };
    }

    const resp = await client.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          shortId: shortId,
        },
      })
    );

    if (!resp.Item) {
      return { statusCode: 404, body: 'URL not found' };
    }

    const originalUrl = resp.Item.originalUrl;
    return {
      statusCode: 302,
      headers: {
        Location: originalUrl,
      },
      body: '',
    };
  } catch (error) {
    console.error('Error in redirectUrl handler:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
