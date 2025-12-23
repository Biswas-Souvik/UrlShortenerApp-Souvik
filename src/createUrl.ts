import { ShortUrlEvent, ShortUrlEventBody } from './types';
import {
  createUrlResponse,
  isValidHttpUrl,
  trimUrl,
  getUniqueShortId,
} from './utils/url.utils';
import { putItem } from './utils/db.utils';

export const handler = async (event: ShortUrlEvent) => {
  try {
    const body: ShortUrlEventBody = JSON.parse(event.body);
    const originalUrl = body?.url;

    if (!originalUrl) return createUrlResponse(400, 'URL is required');

    const trimmedUrl = trimUrl(originalUrl);

    if (!isValidHttpUrl(trimmedUrl))
      return createUrlResponse(400, 'Invalid URL');

    const shortId = getUniqueShortId();
    let resp = await putItem(shortId, trimmedUrl);

    if (resp.status === 'keyAlreadyExists') {
      const shortId = getUniqueShortId();
      resp = await putItem(shortId, trimmedUrl);
    }

    if (resp.status !== 'success')
      return createUrlResponse(500, 'Failed to store URL mapping');

    const baseUrl = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
    const shortUrl = `${baseUrl}/short/${shortId}`;

    return createUrlResponse(201, JSON.stringify({ shortUrl }));
  } catch (error) {
    console.error('Error creating short URL: ', error);
    return createUrlResponse(500, 'Internal Server Error');
  }
};
