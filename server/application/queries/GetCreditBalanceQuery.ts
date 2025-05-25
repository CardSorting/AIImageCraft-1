/**
 * Get Credit Balance Query
 * CQRS Query for retrieving credit balance information
 */

export interface GetCreditBalanceQuery {
  userId: number;
}

export interface CreditBalanceResult {
  userId: number;
  balance: number;
  lastUpdated: Date;
  recentTransactions?: CreditTransactionSummary[];
}

export interface CreditTransactionSummary {
  id: string;
  type: 'PURCHASE' | 'SPEND' | 'REFUND' | 'BONUS';
  amount: number;
  description: string;
  createdAt: Date;
}