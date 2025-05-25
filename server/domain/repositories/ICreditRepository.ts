/**
 * Credit Repository Interface
 * Defines data access contract following Repository pattern
 */

import { Credit, CreditBalance, CreditTransaction, CreditPackage } from '../entities/Credit';

export interface ICreditRepository {
  // Credit Balance Operations
  getCreditBalance(userId: number): Promise<Credit | null>;
  saveCreditBalance(credit: Credit): Promise<void>;
  updateCreditBalance(credit: Credit, expectedVersion: number): Promise<boolean>;
  
  // Transaction Operations
  recordTransaction(transaction: Omit<CreditTransaction, 'id' | 'createdAt'>): Promise<CreditTransaction>;
  getTransactionHistory(userId: number, limit?: number, offset?: number): Promise<CreditTransaction[]>;
  getTransactionById(transactionId: string): Promise<CreditTransaction | null>;
  
  // Package Operations
  getCreditPackages(): Promise<CreditPackage[]>;
  getCreditPackageById(packageId: string): Promise<CreditPackage | null>;
  
  // Atomic Operations
  executeAtomicCreditOperation<T>(operation: () => Promise<T>): Promise<T>;
}