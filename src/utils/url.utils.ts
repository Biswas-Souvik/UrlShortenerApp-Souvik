import { UrlResponse, UrlResponseHeaders } from '../types';

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
