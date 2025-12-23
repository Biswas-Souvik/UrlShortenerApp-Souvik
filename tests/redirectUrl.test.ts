import { handler } from '../src/redirectUrl';
import * as db from '../src/utils/db.utils';

jest.mock('../src/utils/db.utils');

describe('redirectUrl.handler', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 400 when shortId missing', async () => {
    const res = await handler({ pathParameters: {} } as any);
    expect(res.statusCode).toBe(400);
  });

  test('returns 404 if item not found', async () => {
    (db.getItem as jest.Mock).mockResolvedValueOnce({ Item: null });

    const res = await handler({ pathParameters: { shortId: 'abc' } } as any);
    expect(res.statusCode).toBe(404);
  });

  test('returns 302 and Location header', async () => {
    (db.getItem as jest.Mock).mockResolvedValueOnce({
      Item: { originalUrl: 'https://google.com' },
    });

    const res = await handler({ pathParameters: { shortId: 'abc' } } as any);

    expect(res.statusCode).toBe(302);
    expect(res.headers?.Location).toBe('https://google.com');
  });

  test('returns 500 on error', async () => {
    (db.getItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    const res = await handler({ pathParameters: { shortId: 'abc' } } as any);
    expect(res.statusCode).toBe(500);
  });
});
