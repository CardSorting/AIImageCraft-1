/**
 * Credit Controller
 * Presentation layer following Clean Architecture principles
 */

import { Request, Response } from 'express';
import { CreditService } from '../../application/services/CreditService';
import { PurchaseCreditsCommand } from '../../application/commands/PurchaseCreditsCommand';
import { SpendCreditsCommand } from '../../application/commands/SpendCreditsCommand';
import { GetCreditBalanceQuery } from '../../application/queries/GetCreditBalanceQuery';

export class CreditController {
  constructor(private creditService: CreditService) {}

  async getCreditBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const query: GetCreditBalanceQuery = { userId };
      const result = await this.creditService.getCreditBalance(query);
      
      res.json(result);
    } catch (error) {
      console.error('Error getting credit balance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { packageId, userId = 1 } = req.body;
      
      if (!packageId) {
        res.status(400).json({ error: 'Package ID is required' });
        return;
      }

      // Get package details
      const packages = await this.creditService.getCreditPackages();
      const selectedPackage = packages.find(p => p.id === packageId);
      
      if (!selectedPackage) {
        res.status(404).json({ error: 'Package not found' });
        return;
      }

      // Create payment intent (this would use the payment service)
      const paymentResult = {
        clientSecret: `pi_test_${Date.now()}_secret`,
        amount: selectedPackage.price,
        currency: 'usd'
      };

      res.json(paymentResult);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async completePurchase(req: Request, res: Response): Promise<void> {
    try {
      const { userId, packageId, paymentIntentId, amount } = req.body;
      
      if (!userId || !packageId || !paymentIntentId || !amount) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const command: PurchaseCreditsCommand = {
        userId: parseInt(userId),
        packageId,
        paymentIntentId,
        amount: parseFloat(amount),
        currency: 'usd'
      };

      const result = await this.creditService.purchaseCredits(command);
      res.json(result);
    } catch (error) {
      console.error('Error completing purchase:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async spendCredits(req: Request, res: Response): Promise<void> {
    try {
      const { userId, amount, description, metadata } = req.body;
      
      if (!userId || !amount || !description) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const command: SpendCreditsCommand = {
        userId: parseInt(userId),
        amount: parseFloat(amount),
        description,
        metadata
      };

      const result = await this.creditService.spendCredits(command);
      res.json(result);
    } catch (error) {
      console.error('Error spending credits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCreditPackages(req: Request, res: Response): Promise<void> {
    try {
      const packages = await this.creditService.getCreditPackages();
      res.json({ packages });
    } catch (error) {
      console.error('Error getting credit packages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}