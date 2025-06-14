/**
 * Credit Domain Aggregate Root
 * 
 * Apple Design Philosophy: "Focus on the essential"
 * Domain-Driven Design + Clean Architecture
 * 
 * ✓ Encapsulates business rules
 * ✓ Maintains invariants
 * ✓ Event-driven architecture
 * ✓ Immutable value objects
 */

import { nanoid } from "nanoid";

// Domain Events (Event Sourcing pattern)
export abstract class DomainEvent {
  constructor(
    public readonly eventId: string = nanoid(),
    public readonly aggregateId: string,
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class CreditDeductedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly amount: number,
    public readonly reason: string,
    public readonly balanceAfter: number
  ) {
    super(nanoid(), aggregateId);
  }
}

export class CreditRefundedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly amount: number,
    public readonly reason: string,
    public readonly balanceAfter: number
  ) {
    super(nanoid(), aggregateId);
  }
}

// Value Objects (Immutable)
export class CreditBalance {
  private constructor(private readonly _amount: number) {
    if (_amount < 0) {
      throw new Error("Credit balance cannot be negative");
    }
    if (!Number.isFinite(_amount)) {
      throw new Error("Credit balance must be a finite number");
    }
  }

  static create(amount: number): CreditBalance {
    return new CreditBalance(amount);
  }

  static zero(): CreditBalance {
    return new CreditBalance(0);
  }

  get amount(): number {
    return this._amount;
  }

  deduct(amount: number): CreditBalance {
    return new CreditBalance(this._amount - amount);
  }

  add(amount: number): CreditBalance {
    return new CreditBalance(this._amount + amount);
  }

  hasSufficientCredits(requiredAmount: number): boolean {
    return this._amount >= requiredAmount;
  }

  equals(other: CreditBalance): boolean {
    return this._amount === other._amount;
  }
}

export class TransactionId {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error("Transaction ID cannot be empty");
    }
  }

  static generate(): TransactionId {
    return new TransactionId(nanoid());
  }

  static fromString(value: string): TransactionId {
    return new TransactionId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: TransactionId): boolean {
    return this._value === other._value;
  }
}

// Aggregate Root
export class CreditAccount {
  private _domainEvents: DomainEvent[] = [];
  
  private constructor(
    private readonly _userId: number,
    private _balance: CreditBalance,
    private readonly _version: number = 1,
    private readonly _createdAt: Date = new Date(),
    private _lastUpdated: Date = new Date()
  ) {}

  // Factory Methods
  static create(userId: number, initialBalance: number = 20): CreditAccount {
    const balance = CreditBalance.create(initialBalance);
    return new CreditAccount(userId, balance);
  }

  static restore(
    userId: number,
    balance: number,
    version: number,
    createdAt: Date,
    lastUpdated: Date
  ): CreditAccount {
    return new CreditAccount(
      userId,
      CreditBalance.create(balance),
      version,
      createdAt,
      lastUpdated
    );
  }

  // Getters
  get userId(): number {
    return this._userId;
  }

  get balance(): CreditBalance {
    return this._balance;
  }

  get version(): number {
    return this._version;
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  // Business Logic Methods
  deductCredits(amount: number, reason: string): TransactionResult {
    if (!this._balance.hasSufficientCredits(amount)) {
      return TransactionResult.insufficient(
        amount,
        this._balance.amount,
        `Insufficient credits: need ${amount}, have ${this._balance.amount}`
      );
    }

    const previousBalance = this._balance;
    this._balance = this._balance.deduct(amount);
    this._lastUpdated = new Date();

    const event = new CreditDeductedEvent(
      this._userId.toString(),
      amount,
      reason,
      this._balance.amount
    );
    this._domainEvents.push(event);

    return TransactionResult.success(
      TransactionId.generate(),
      previousBalance,
      this._balance
    );
  }

  refundCredits(amount: number, reason: string): TransactionResult {
    const previousBalance = this._balance;
    this._balance = this._balance.add(amount);
    this._lastUpdated = new Date();

    const event = new CreditRefundedEvent(
      this._userId.toString(),
      amount,
      reason,
      this._balance.amount
    );
    this._domainEvents.push(event);

    return TransactionResult.success(
      TransactionId.generate(),
      previousBalance,
      this._balance
    );
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}

// Result Pattern for Operation Results
export class TransactionResult {
  private constructor(
    public readonly success: boolean,
    public readonly transactionId?: TransactionId,
    public readonly previousBalance?: CreditBalance,
    public readonly newBalance?: CreditBalance,
    public readonly errorMessage?: string,
    public readonly requiredAmount?: number,
    public readonly availableAmount?: number
  ) {}

  static success(
    transactionId: TransactionId,
    previousBalance: CreditBalance,
    newBalance: CreditBalance
  ): TransactionResult {
    return new TransactionResult(
      true,
      transactionId,
      previousBalance,
      newBalance
    );
  }

  static insufficient(
    requiredAmount: number,
    availableAmount: number,
    errorMessage: string
  ): TransactionResult {
    return new TransactionResult(
      false,
      undefined,
      undefined,
      undefined,
      errorMessage,
      requiredAmount,
      availableAmount
    );
  }

  static failure(errorMessage: string): TransactionResult {
    return new TransactionResult(false, undefined, undefined, undefined, errorMessage);
  }
}

// Domain Service for Credit Calculations
export class CreditDomainService {
  calculateImageGenerationCost(aspectRatio: string, numImages: number): number {
    const baseCreditsPerImage = 0.5; // Standard 0.5 credits per image
    const aspectRatioMultiplier = aspectRatio === "16:9" || aspectRatio === "9:16" ? 1.0 : 1.0; // No multiplier, flat rate
    return baseCreditsPerImage * numImages;
  }

  validateImageGenerationRequest(prompt: string, aspectRatio: string, numImages: number): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Prompt cannot be empty");
    }

    if (numImages < 1 || numImages > 10) {
      throw new Error("Number of images must be between 1 and 10");
    }

    const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
    if (!validAspectRatios.includes(aspectRatio)) {
      throw new Error(`Invalid aspect ratio. Must be one of: ${validAspectRatios.join(", ")}`);
    }
  }
}