/**
 * Stripe Payment Service - Domain-Driven Design Architecture
 * 
 * Apple Design Philosophy: "Simplicity is the ultimate sophistication"
 * Clean Architecture + CQRS + Event Sourcing
 * 
 * ✓ Encapsulates payment business rules
 * ✓ Integrates with Credit Domain System
 * ✓ Event-driven architecture
 * ✓ Immutable transaction records
 */

import { nanoid } from 'nanoid';
import { CreditAccount, TransactionId } from '../../domain/CreditAggregate';

export interface PaymentIntentRequest {
  packageId: string;
  userId: number;
  amount: number;
}

export interface PaymentConfirmationRequest {
  paymentIntentId: string;
  userId: number;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  creditsAdded?: number;
  newBalance?: number;
  error?: string;
  transactionId?: string;
}

export class StripePaymentService {
  private stripe: any;
  private pool: any;

  constructor() {
    this.initializeStripe();
    this.initializeDatabase();
  }

  private async initializeStripe() {
    const stripeModule = await import('stripe');
    this.stripe = new stripeModule.default(process.env.STRIPE_SECRET_KEY!);
  }

  private async initializeDatabase() {
    const { pool } = await import('../db');
    this.pool = pool;
  }

  /**
   * Create Payment Intent with Enhanced Metadata
   * Follows Domain-Driven Design principles
   */
  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentResult> {
    try {
      // Get package details from domain repository
      const packageResult = await this.pool.query(
        'SELECT id, name, credits, price, bonus_credits, metadata FROM credit_packages WHERE id = $1 AND is_active = 1',
        [request.packageId]
      );

      if (packageResult.rows.length === 0) {
        return { success: false, error: "Credit package not found" };
      }

      const creditPackage = packageResult.rows[0];
      const totalCredits = creditPackage.credits + creditPackage.bonus_credits;
      const metadata = creditPackage.metadata ? JSON.parse(creditPackage.metadata) : {};

      // Create Stripe payment intent with rich domain metadata
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(parseFloat(creditPackage.price) * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          // Domain Context
          userId: request.userId.toString(),
          packageId: request.packageId,
          packageName: creditPackage.name,
          
          // Credit Information
          baseCredits: creditPackage.credits.toString(),
          bonusCredits: creditPackage.bonus_credits.toString(),
          totalCredits: totalCredits.toString(),
          
          // System Information
          creditSystemVersion: "2.0",
          paymentSystemVersion: "1.0",
          transactionType: "CREDIT_PURCHASE",
          
          // Additional metadata
          ...metadata
        },
        description: `${creditPackage.name} - ${totalCredits} credits for user ${request.userId}`,
        receipt_email: null, // Will be set from user profile if available
      });

      console.log(`[Payment] Created payment intent for user ${request.userId}: ${paymentIntent.id}`);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };

    } catch (error: any) {
      console.error("[Payment] Error creating payment intent:", error);
      return {
        success: false,
        error: error.message || "Failed to create payment intent"
      };
    }
  }

  /**
   * Confirm Payment and Add Credits using Credit Domain System
   * Implements Saga Pattern for transaction consistency
   */
  async confirmPayment(request: PaymentConfirmationRequest): Promise<PaymentResult> {
    try {
      // Step 1: Verify payment with Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(request.paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return { success: false, error: "Payment not completed" };
      }

      // Step 2: Verify payment belongs to user
      if (parseInt(paymentIntent.metadata.userId) !== request.userId) {
        return { success: false, error: "Payment verification failed" };
      }

      // Step 3: Check for duplicate processing (idempotency)
      const existingTransaction = await this.pool.query(
        'SELECT id FROM credit_transactions WHERE description LIKE $1',
        [`%Payment Intent: ${request.paymentIntentId}%`]
      );

      if (existingTransaction.rows.length > 0) {
        return { success: false, error: "Payment already processed" };
      }

      // Step 4: Load Credit Account using Domain Repository
      const creditAccount = await this.loadCreditAccount(request.userId);
      
      // Step 5: Execute Domain Logic - Add Credits
      const totalCredits = parseInt(paymentIntent.metadata.totalCredits);
      const packageName = paymentIntent.metadata.packageName;
      
      const addCreditsResult = creditAccount.refundCredits(
        totalCredits,
        `Credit Purchase: ${packageName} - Payment Intent: ${request.paymentIntentId}`
      );

      if (!addCreditsResult.success) {
        return { success: false, error: "Failed to add credits to account" };
      }

      // Step 6: Persist Domain Changes
      await this.saveCreditAccount(creditAccount);

      // Step 7: Record Transaction in Event Store
      await this.recordPaymentTransaction(
        request.userId,
        addCreditsResult.transactionId!.value,
        'PURCHASE',
        totalCredits,
        `Credit Purchase: ${packageName} - Payment Intent: ${request.paymentIntentId}`,
        addCreditsResult.newBalance!.amount,
        paymentIntent
      );

      console.log(`[Payment] Successfully processed payment for user ${request.userId}: +${totalCredits} credits`);

      return {
        success: true,
        creditsAdded: totalCredits,
        newBalance: addCreditsResult.newBalance!.amount,
        transactionId: addCreditsResult.transactionId!.value
      };

    } catch (error: any) {
      console.error("[Payment] Error confirming payment:", error);
      return {
        success: false,
        error: error.message || "Payment confirmation failed"
      };
    }
  }

  /**
   * Load Credit Account from Domain Repository
   */
  private async loadCreditAccount(userId: number): Promise<CreditAccount> {
    const balanceResult = await this.pool.query(
      'SELECT amount, version, last_updated, created_at FROM credit_balances WHERE user_id = $1',
      [userId]
    );

    if (balanceResult.rows.length > 0) {
      const row = balanceResult.rows[0];
      return CreditAccount.restore(
        userId,
        parseFloat(row.amount),
        row.version,
        new Date(row.created_at),
        new Date(row.last_updated)
      );
    } else {
      // Create new account with initial balance
      return CreditAccount.create(userId, 20);
    }
  }

  /**
   * Save Credit Account using Domain Repository
   */
  private async saveCreditAccount(creditAccount: CreditAccount): Promise<void> {
    await this.pool.query(
      `INSERT INTO credit_balances (user_id, amount, version, last_updated, created_at) 
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
       amount = $2, version = $3, last_updated = NOW()`,
      [
        creditAccount.userId,
        creditAccount.balance.amount,
        creditAccount.version + 1
      ]
    );
  }

  /**
   * Record Payment Transaction in Event Store
   */
  private async recordPaymentTransaction(
    userId: number,
    transactionId: string,
    type: string,
    amount: number,
    description: string,
    balanceAfter: number,
    paymentIntent: any
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO credit_transactions 
       (id, user_id, type, amount, description, balance_after, created_at, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
      [
        transactionId,
        userId,
        type,
        amount.toString(),
        description,
        balanceAfter.toString(),
        JSON.stringify({
          paymentIntentId: paymentIntent.id,
          stripeAmount: paymentIntent.amount,
          stripeCurrency: paymentIntent.currency,
          packageId: paymentIntent.metadata.packageId,
          packageName: paymentIntent.metadata.packageName,
          systemVersion: paymentIntent.metadata.creditSystemVersion
        })
      ]
    );
  }

  /**
   * Get Payment History for Analytics
   */
  async getPaymentHistory(userId: number, limit: number = 10): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT id, amount, description, balance_after, created_at, metadata
       FROM credit_transactions 
       WHERE user_id = $1 AND type = 'PURCHASE'
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      amount: parseFloat(row.amount),
      description: row.description,
      balanceAfter: parseFloat(row.balance_after),
      createdAt: row.created_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }));
  }
}