/**
 * Spend Credits Command
 * CQRS Command for credit spending operations
 */

export interface SpendCreditsCommand {
  userId: number;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface SpendCreditsResult {
  success: boolean;
  transactionId: string;
  creditsSpent: number;
  newBalance: number;
  error?: string;
}