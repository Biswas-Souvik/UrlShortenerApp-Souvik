import { ShortUrlEvent, ShortUrlEventBody } from './types';
import { createUrlResponse } from './utils/url.utils';
import { putItem } from './utils/db.utils';

import crypto from 'crypto';

export const handler = async (event: ShortUrlEvent) => {
  try {
    const body: ShortUrlEventBody = JSON.parse(event.body);
    const originalUrl = body?.url;

    if (!originalUrl) return createUrlResponse(400, 'URL is required');

    const shortId = crypto.randomBytes(4).toString('hex');
    const resp = await putItem(shortId, originalUrl);
    if (!resp) return createUrlResponse(500, 'Failed to store URL mapping');

    const baseUrl = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
    const shortUrl = `${baseUrl}/short/${shortId}`;

    return createUrlResponse(201, JSON.stringify({ shortUrl }));
  } catch (error) {
    console.error('Error creating short URL: ', error);
    return createUrlResponse(500, 'Internal Server Error');
  }
};
