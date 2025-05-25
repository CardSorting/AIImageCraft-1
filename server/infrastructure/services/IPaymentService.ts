/**
 * Payment Service Interface
 * Abstraction for payment processing following Dependency Inversion Principle
 */

export interface PaymentVerification {
  success: boolean;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  error?: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

export interface IPaymentService {
  createPaymentIntent(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResult>;
  verifyPayment(paymentIntentId: string, expectedAmount: number): Promise<PaymentVerification>;
  refundPayment(paymentIntentId: string, amount?: number): Promise<{ success: boolean; error?: string }>;
}