/**
 * Credit Service
 * Application Service implementing business logic with clean architecture
 */

import { ICreditRepository } from '../../domain/repositories/ICreditRepository';
import { Credit } from '../../domain/entities/Credit';
import { PurchaseCreditsCommand, PurchaseCreditsResult } from '../commands/PurchaseCreditsCommand';
import { SpendCreditsCommand, SpendCreditsResult } from '../commands/SpendCreditsCommand';
import { GetCreditBalanceQuery, CreditBalanceResult } from '../queries/GetCreditBalanceQuery';
import { IPaymentService } from '../../infrastructure/services/IPaymentService';
import { IEventPublisher } from '../../infrastructure/events/IEventPublisher';

export class CreditService {
  constructor(
    private readonly creditRepository: ICreditRepository,
    private readonly paymentService: IPaymentService,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async purchaseCredits(command: PurchaseCreditsCommand): Promise<PurchaseCreditsResult> {
    try {
      // Verify payment with Stripe
      const paymentVerification = await this.paymentService.verifyPayment(
        command.paymentIntentId,
        command.amount
      );

      if (!paymentVerification.success) {
        return {
          success: false,
          transactionId: '',
          creditsAdded: 0,
          newBalance: 0,
          error: 'Payment verification failed'
        };
      }

      // Get credit package details
      const creditPackage = await this.creditRepository.getCreditPackageById(command.packageId);
      if (!creditPackage) {
        return {
          success: false,
          transactionId: '',
          creditsAdded: 0,
          newBalance: 0,
          error: 'Invalid credit package'
        };
      }

      // Execute atomic credit addition
      const result = await this.creditRepository.executeAtomicCreditOperation(async () => {
        // Get or create user credit balance
        let userCredit = await this.creditRepository.getCreditBalance(command.userId);
        if (!userCredit) {
          userCredit = Credit.create(command.userId);
          await this.creditRepository.saveCreditBalance(userCredit);
        }

        // Add credits (base + bonus)
        const totalCredits = creditPackage.credits + creditPackage.bonusCredits;
        const updatedCredit = userCredit.add(totalCredits);

        // Update balance with optimistic locking
        const updateSuccess = await this.creditRepository.updateCreditBalance(
          updatedCredit,
          userCredit.version
        );

        if (!updateSuccess) {
          throw new Error('Credit balance update failed due to concurrent modification');
        }

        // Record transaction
        const transaction = await this.creditRepository.recordTransaction({
          userId: command.userId,
          type: 'PURCHASE',
          amount: totalCredits,
          description: `Purchased ${creditPackage.name}`,
          balanceAfter: updatedCredit.amount,
          metadata: {
            packageId: command.packageId,
            paymentIntentId: command.paymentIntentId,
            baseCredits: creditPackage.credits,
            bonusCredits: creditPackage.bonusCredits
          }
        });

        return {
          transactionId: transaction.id,
          creditsAdded: totalCredits,
          newBalance: updatedCredit.amount
        };
      });

      // Publish credit purchased event
      await this.eventPublisher.publish('CreditsPurchased', {
        userId: command.userId,
        creditsAdded: result.creditsAdded,
        newBalance: result.newBalance,
        packageId: command.packageId,
        transactionId: result.transactionId
      });

      return {
        success: true,
        ...result
      };

    } catch (error) {
      console.error('Credit purchase failed:', error);
      return {
        success: false,
        transactionId: '',
        creditsAdded: 0,
        newBalance: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async spendCredits(command: SpendCreditsCommand): Promise<SpendCreditsResult> {
    try {
      const result = await this.creditRepository.executeAtomicCreditOperation(async () => {
        // Get user credit balance
        const userCredit = await this.creditRepository.getCreditBalance(command.userId);
        if (!userCredit) {
          throw new Error('User credit balance not found');
        }

        // Check if user can spend the amount
        if (!userCredit.canSpend(command.amount)) {
          throw new Error('Insufficient credits');
        }

        // Spend credits
        const updatedCredit = userCredit.spend(command.amount);

        // Update balance with optimistic locking
        const updateSuccess = await this.creditRepository.updateCreditBalance(
          updatedCredit,
          userCredit.version
        );

        if (!updateSuccess) {
          throw new Error('Credit balance update failed due to concurrent modification');
        }

        // Record transaction
        const transaction = await this.creditRepository.recordTransaction({
          userId: command.userId,
          type: 'SPEND',
          amount: -command.amount, // Negative for spending
          description: command.description,
          balanceAfter: updatedCredit.amount,
          metadata: command.metadata
        });

        return {
          transactionId: transaction.id,
          creditsSpent: command.amount,
          newBalance: updatedCredit.amount
        };
      });

      // Publish credit spent event
      await this.eventPublisher.publish('CreditsSpent', {
        userId: command.userId,
        creditsSpent: command.amount,
        newBalance: result.newBalance,
        description: command.description,
        transactionId: result.transactionId
      });

      return {
        success: true,
        ...result
      };

    } catch (error) {
      console.error('Credit spending failed:', error);
      return {
        success: false,
        transactionId: '',
        creditsSpent: 0,
        newBalance: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getCreditBalance(query: GetCreditBalanceQuery): Promise<CreditBalanceResult> {
    const userCredit = await this.creditRepository.getCreditBalance(query.userId);
    
    if (!userCredit) {
      // Create initial balance for new user
      const newCredit = Credit.create(query.userId);
      await this.creditRepository.saveCreditBalance(newCredit);
      
      return {
        userId: query.userId,
        balance: 0,
        lastUpdated: new Date()
      };
    }

    // Get recent transactions
    const recentTransactions = await this.creditRepository.getTransactionHistory(
      query.userId,
      5 // Last 5 transactions
    );

    return {
      userId: userCredit.userId,
      balance: userCredit.amount,
      lastUpdated: userCredit.lastUpdated,
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: Math.abs(tx.amount),
        description: tx.description,
        createdAt: tx.createdAt
      }))
    };
  }

  async getCreditPackages() {
    return await this.creditRepository.getCreditPackages();
  }
}