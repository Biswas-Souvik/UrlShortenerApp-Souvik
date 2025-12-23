import { handler } from '../src/createUrl';
import * as db from '../src/utils/db.utils';
import * as utils from '../src/utils/url.utils';

jest.mock('../src/utils/db.utils');

describe('createUrl.handler', () => {
  beforeEach(() => jest.clearAllMocks());

  const baseEvent = {
    body: JSON.stringify({ url: 'https://google.com' }),
    requestContext: {
      domainName: 'example.com',
      stage: 'dev',
    },
  };

  test('returns 400 if URL is missing', async () => {
    const event = { ...baseEvent, body: JSON.stringify({}) };
    const res = await handler(event as any);
    expect(res.statusCode).toBe(400);
    expect(res.body).toContain('URL is required');
  });

  test('returns 400 if URL is invalid', async () => {
    const event = {
      ...baseEvent,
      body: JSON.stringify({ url: 'invalid-text' }),
    };
    const res = await handler(event as any);
    expect(res.statusCode).toBe(400);
    expect(res.body).toContain('Invalid URL');
  });

  test('stores URL and returns short URL', async () => {
    jest.spyOn(utils, 'getUniqueShortId').mockReturnValue('id123');
    (db.putItem as jest.Mock).mockResolvedValueOnce({ status: 'success' });

    const res = await handler(baseEvent as any);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(201);
    expect(body.shortUrl).toBe('https://example.com/dev/short/id123');
  });

  test('retries when shortId already exists', async () => {
    jest
      .spyOn(utils, 'getUniqueShortId')
      .mockReturnValueOnce('id1')
      .mockReturnValueOnce('id2');

    (db.putItem as jest.Mock)
      .mockResolvedValueOnce({ status: 'keyAlreadyExists' })
      .mockResolvedValueOnce({ status: 'success' });

    const res = await handler(baseEvent as any);

    expect(db.putItem).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toBe(201);
  });

  test('returns 500 when storing fails', async () => {
    jest.spyOn(utils, 'getUniqueShortId').mockReturnValue('id123');
    (db.putItem as jest.Mock).mockResolvedValueOnce({ status: 'error' });

    const res = await handler(baseEvent as any);
    expect(res.statusCode).toBe(500);
  });
  test('returns 500 on error', async () => {
    (db.putItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    const res = await handler(baseEvent as any);
    expect(res.statusCode).toBe(500);
    expect(res.body).toContain('Internal Server Error');
  });
});
