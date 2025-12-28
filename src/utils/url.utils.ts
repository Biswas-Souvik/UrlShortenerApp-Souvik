import { UrlResponse, UrlResponseHeaders } from '../types';
import { ShortIdStrategyFactory } from './shortId.utils';

export const trimUrl = (url: string): string => {
  // the regex "/\/+$/" removes trailing slashes,
  // refer: https://bobbyhadz.com/blog/javascript-remove-trailing-slash-from-string
  return url.trim().replace(/\/+$/, '');
};

export const isValidHttpUrl = (urlString: string): boolean => {
  const validProtocols = ['http:', 'https:'];
  try {
    const newUrl = new URL(urlString);
    // Refer: https://www.freecodecamp.org/news/how-to-validate-urls-in-javascript/
    return validProtocols.includes(newUrl.protocol); // to validate only http/https urls
  } catch (err) {
    return false;
  }
};

export const getUniqueShortId = (): string => {
  const strategy = ShortIdStrategyFactory.getStrategy('crypto');
  return strategy.generate();
};

export const createUrlResponse = (
  statusCode: number,
  body: string,
  headers: UrlResponseHeaders = {}
): UrlResponse => {
  const output: UrlResponse = { statusCode, body };

  if (headers && 'Location' in headers) {
    output.headers = headers;
  }

  return output;
};
