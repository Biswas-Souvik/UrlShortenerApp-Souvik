import { handler } from '../src/createUrl';
import * as db from '../src/utils/db.utils';
import * as url from '../src/utils/url.utils';

jest.mock('../src/utils/db.utils');
const mockedDb = jest.mocked(db);

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
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
    expect(res.body).toContain('URL is required');
  });

  test('returns 400 if URL is invalid', async () => {
    const event = {
      ...baseEvent,
      body: JSON.stringify({ url: 'invalid-text' }),
    };
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
    expect(res.body).toContain('Invalid URL');
  });

  test('stores URL and returns short URL if original URL does not exist', async () => {
    mockedDb.getByOriginalUrl.mockResolvedValue({
      error: false,
      item: null,
    });

    jest.spyOn(url, 'getUniqueShortId').mockReturnValue('id123');
    mockedDb.putItem.mockResolvedValueOnce({ status: 'success' });

    const res = await handler(baseEvent);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(201);
    expect(body.shortUrl).toBe('https://example.com/dev/short/id123');
  });

  test('retries when shortId already exists', async () => {
    mockedDb.getByOriginalUrl.mockResolvedValue({
      error: false,
      item: null,
    });

    jest
      .spyOn(url, 'getUniqueShortId')
      .mockReturnValueOnce('id1')
      .mockReturnValueOnce('id2');

    mockedDb.putItem
      .mockResolvedValueOnce({ status: 'keyAlreadyExists' })
      .mockResolvedValueOnce({ status: 'success' });

    const res = await handler(baseEvent);

    expect(db.putItem).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toBe(201);
  });

  test('returns 500 when storing fails', async () => {
    mockedDb.getByOriginalUrl.mockResolvedValue({
      error: false,
      item: null,
    });

    jest.spyOn(url, 'getUniqueShortId').mockReturnValue('id123');
    mockedDb.putItem.mockResolvedValueOnce({ status: 'error' });

    const res = await handler(baseEvent);
    expect(res.statusCode).toBe(500);
  });

  test('returns 500 when putItem throws', async () => {
    mockedDb.getByOriginalUrl.mockResolvedValue({
      error: false,
      item: null,
    });

    mockedDb.putItem.mockRejectedValueOnce(new Error('fail'));

    const res = await handler(baseEvent);
    expect(res.statusCode).toBe(500);
    expect(res.body).toContain('Internal Server Error');
  });

  test('returns existing short URL if original URL already exists', async () => {
    mockedDb.getByOriginalUrl.mockResolvedValue({
      error: false,
      item: {
        shortId: 'existing123',
      },
    });

    const res = await handler(baseEvent);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.shortUrl).toBe('https://example.com/dev/short/existing123');
  });

  test('returns 503 if error occurs checking existing URL', async () => {
    mockedDb.getByOriginalUrl.mockResolvedValue({
      error: true,
      item: null,
    });

    const res = await handler(baseEvent);
    expect(res.statusCode).toBe(500);
    expect(res.body).toContain('Failed to check existing URL');
  });
});
