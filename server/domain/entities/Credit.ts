/**
 * Credit Domain Entity
 * Core business entity representing user credits
 */

export interface CreditBalance {
  userId: number;
  amount: number;
  lastUpdated: Date;
  version: number; // For optimistic locking
}

export interface CreditTransaction {
  id: string;
  userId: number;
  type: 'PURCHASE' | 'SPEND' | 'REFUND' | 'BONUS';
  amount: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  balanceAfter: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits: number;
  isActive: boolean;
  displayOrder: number;
  metadata?: Record<string, any>;
}

export class Credit {
  private constructor(
    public readonly userId: number,
    public readonly amount: number,
    public readonly lastUpdated: Date,
    public readonly version: number = 0
  ) {
    if (amount < 0) {
      throw new Error('Credit amount cannot be negative');
    }
  }

  static create(userId: number, initialAmount: number = 0): Credit {
    return new Credit(userId, initialAmount, new Date(), 0);
  }

  static fromData(data: CreditBalance): Credit {
    return new Credit(data.userId, data.amount, data.lastUpdated, data.version);
  }

  canSpend(amount: number): boolean {
    return this.amount >= amount && amount > 0;
  }

  spend(amount: number): Credit {
    if (!this.canSpend(amount)) {
      throw new Error('Insufficient credits');
    }
    return new Credit(
      this.userId,
      this.amount - amount,
      new Date(),
      this.version + 1
    );
  }

  add(amount: number): Credit {
    if (amount <= 0) {
      throw new Error('Amount to add must be positive');
    }
    return new Credit(
      this.userId,
      this.amount + amount,
      new Date(),
      this.version + 1
    );
  }

  toData(): CreditBalance {
    return {
      userId: this.userId,
      amount: this.amount,
      lastUpdated: this.lastUpdated,
      version: this.version
    };
  }
}