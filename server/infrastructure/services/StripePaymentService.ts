/**
 * Stripe Payment Service Implementation
 * Concrete implementation of IPaymentService using Stripe
 */

import Stripe from "stripe";
import { IPaymentService, PaymentVerification, CreatePaymentIntentRequest, CreatePaymentIntentResult } from "./IPaymentService";

export class StripePaymentService implements IPaymentService {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey);
  }

  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency,
        metadata: request.metadata || {},
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret || undefined,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown payment error'
      };
    }
  }

  async verifyPayment(paymentIntentId: string, expectedAmount: number): Promise<PaymentVerification> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      const actualAmount = paymentIntent.amount / 100; // Convert from cents
      const isAmountCorrect = Math.abs(actualAmount - expectedAmount) < 0.01; // Allow for rounding
      
      return {
        success: paymentIntent.status === 'succeeded' && isAmountCorrect,
        paymentIntentId,
        amount: actualAmount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        error: paymentIntent.status !== 'succeeded' ? 'Payment not completed' : 
               !isAmountCorrect ? 'Amount mismatch' : undefined
      };
    } catch (error) {
      return {
        success: false,
        paymentIntentId,
        amount: 0,
        currency: 'usd',
        status: 'error',
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<{ success: boolean; error?: string }> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId
      };
      
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      await this.stripe.refunds.create(refundData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      };
    }
  }
}