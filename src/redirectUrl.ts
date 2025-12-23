import { RedirectUrlEvent } from './types';
import { createUrlResponse } from './utils/url.utils';
import { getItem } from './utils/db.utils';

export const handler = async (event: RedirectUrlEvent) => {
  try {
    const shortId = event.pathParameters?.shortId;

    if (!shortId) return createUrlResponse(400, 'Short ID is required');
    const resp = await getItem(shortId);

    if (!resp.Item) return createUrlResponse(404, 'URL not found');

    const originalUrl = resp.Item.originalUrl;
    return createUrlResponse(302, '', { Location: originalUrl });
  } catch (error) {
    console.error('Error Redirecting short URL: ', error);
    return createUrlResponse(500, 'Internal Server Error');
  }
};
