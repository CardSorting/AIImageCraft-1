/**
 * Payment Service Interface
 * Defines contract for payment processing
 */

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface IPaymentService {
  createPaymentIntent(amount: number, currency: string, metadata?: Record<string, any>): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<PaymentResult>;
  refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentResult>;
}