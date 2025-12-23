import { putItem, getItem, getByOriginalUrl } from '../src/utils/db.utils';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  GetCommand: jest.fn(),
  PutCommand: jest.fn(),
  QueryCommand: jest.fn(),
}));

describe('db.utils', () => {
  const mockSend = jest.fn();

  beforeAll(() => {
    DynamoDBClient.prototype.send = mockSend;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('putItem returns success', async () => {
    mockSend.mockResolvedValueOnce({});

    const res = await putItem('abc', 'https://google.com');
    expect(res.status).toBe('success');
  });

  test('putItem returns keyAlreadyExists on ConditionalCheckFailedException', async () => {
    mockSend.mockRejectedValueOnce({ name: 'ConditionalCheckFailedException' });

    const res = await putItem('abc', 'https://google.com');
    expect(res.status).toBe('keyAlreadyExists');
  });

  test('putItem returns error for other DynamoDB problems', async () => {
    mockSend.mockRejectedValueOnce({ message: 'Something went wrong' });

    const res = await putItem('abc', 'https://google.com');
    expect(res.status).toBe('error');
    expect(res.message).toBe('Something went wrong');
  });

  test('getItem returns item on success', async () => {
    mockSend.mockResolvedValueOnce({
      Item: { originalUrl: 'https://google.com' },
    });

    const res = await getItem('abc');
    expect(res.Item?.originalUrl).toBe('https://google.com');
  });

  test('getItem handles errors', async () => {
    mockSend.mockRejectedValueOnce(new Error('Dynamo fail'));

    const res = await getItem('abc');
    expect(res.Item).toBe(null);
  });

  test('getByOriginalUrl returns item on success', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{ shortId: 'abc', originalUrl: 'https://google.com' }],
    });

    const res = await getByOriginalUrl('https://google.com');
    expect(res.error).toBe(false);
    expect(res.item).not.toBeNull();
    expect(res.item?.shortId).toBe('abc');
  });
  test('getByOriginalUrl handles errors', async () => {
    mockSend.mockRejectedValueOnce(new Error('Dynamo fail'));
    const res = await getByOriginalUrl('https://google.com');
    expect(res.error).toBe(true);
    expect(res.item).toBe(null);
  });
});
