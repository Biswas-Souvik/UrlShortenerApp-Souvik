import { handler } from '../src/redirectUrl';
import * as db from '../src/utils/db.utils';

jest.mock('../src/utils/db.utils');
const mockedDb = jest.mocked(db);

describe('redirectUrl.handler', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 400 when shortId missing', async () => {
    const res = await handler({ pathParameters: {} } as any);
    expect(res.statusCode).toBe(400);
  });

  test('returns 404 if item not found', async () => {
    mockedDb.getItem.mockResolvedValueOnce({ Item: null, message: '' });

    const res = await handler({ pathParameters: { shortId: 'abc' } });
    expect(res.statusCode).toBe(404);
  });

  test('returns 302 and Location header', async () => {
    mockedDb.getItem.mockResolvedValueOnce({
      Item: { originalUrl: 'https://google.com' },
    } as any);

    const res = await handler({ pathParameters: { shortId: 'abc' } });

    expect(res.statusCode).toBe(302);
    expect(res.headers?.Location).toBe('https://google.com');
  });

  test('returns 500 on error', async () => {
    mockedDb.getItem.mockRejectedValueOnce(new Error('fail'));

    const res = await handler({ pathParameters: { shortId: 'abc' } });
    expect(res.statusCode).toBe(500);
  });
});
