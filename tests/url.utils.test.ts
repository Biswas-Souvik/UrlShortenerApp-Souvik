import {
  trimUrl,
  isValidHttpUrl,
  getUniqueShortId,
  createUrlResponse,
} from '../src/utils/url.utils';

describe('URL Utils', () => {
  test('trimUrl removes spaces and trailing slash', () => {
    expect(trimUrl('  https://google.com//  ')).toBe('https://google.com');
    expect(trimUrl('https://google.com')).toBe('https://google.com');
    expect(trimUrl('https://google.com/')).toBe('https://google.com');
    expect(trimUrl('https://google.com/index.html')).toBe(
      'https://google.com/index.html'
    );
  });

  test('isValidHttpUrl validates http/https', () => {
    expect(isValidHttpUrl('https://google.com')).toBe(true);
    expect(isValidHttpUrl('http://example.com')).toBe(true);
  });

  test('isvalidHttpUrl rejects non-http/https URLs', () => {
    expect(isValidHttpUrl('mailto://example.org')).toBe(false);
    expect(isValidHttpUrl('ftp://example.org')).toBe(false);
  });

  test('isValidHttpUrl rejects invalid URLs', () => {
    expect(isValidHttpUrl('google.com')).toBe(false);
    expect(isValidHttpUrl('random text')).toBe(false);
    expect(isValidHttpUrl('://missing-protocol.com')).toBe(false);
  });

  test('getUniqueShortId creates hex string', () => {
    const id = getUniqueShortId();
    expect(id).toMatch(/^[a-f0-9]+$/);
    expect(id.length).toBe(16); // 8 bytes → 16 hex chars
  });

  test('createUrlResponse returns structure', () => {
    expect(createUrlResponse(200, 'OK')).toEqual({
      statusCode: 200,
      body: 'OK',
    });
  });

  test('createUrlResponse sets Location header if provided', () => {
    const res = createUrlResponse(302, '', { Location: 'https://google.com' });
    expect(res.headers?.Location).toBe('https://google.com');
  });
});
