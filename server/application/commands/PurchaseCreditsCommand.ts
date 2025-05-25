/**
 * Purchase Credits Command
 * Implements CQRS Command pattern for credit purchases
 */

export interface PurchaseCreditsCommand {
  userId: number;
  packageId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface PurchaseCreditsResult {
  success: boolean;
  transactionId: string;
  creditsAdded: number;
  newBalance: number;
  error?: string;
}