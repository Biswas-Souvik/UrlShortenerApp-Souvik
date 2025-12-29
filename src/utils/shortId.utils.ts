import crypto from 'crypto';
const SHORT_ID_BYTE_SIZE = 8;

// Strategy for short id generation
export interface ShortIdStrategy {
  generate(): string;
}

class CryptoShortIDStrategy implements ShortIdStrategy {
  generate() {
    return crypto.randomBytes(SHORT_ID_BYTE_SIZE).toString('hex');
  }
}

export class ShortIdStrategyFactory {
  static getStrategy(strategyType: string): ShortIdStrategy {
    // Here we can add logic to choose different strategies in future
    if (strategyType === 'crypto') {
      return new CryptoShortIDStrategy();
    } else {
      throw new Error('Unknown ShortIdStrategy type');
    }
  }
}
