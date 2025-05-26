/**
 * Credit Transaction Service
 * 
 * Apple Design Philosophy: "Simplicity is the ultimate sophistication"
 * SOLID Principles + Clean Architecture + DDD Implementation
 * 
 * ✓ Single Responsibility: Handles credit transactions exclusively
 * ✓ Open/Closed: Extensible for new transaction types
 * ✓ Liskov Substitution: Interface-based design
 * ✓ Interface Segregation: Focused interfaces
 * ✓ Dependency Inversion: Depends on abstractions
 */

import { nanoid } from "nanoid";
import { pool } from "../../infrastructure/db";
import { storage } from "../../storage";
import { 
  CreditAccount, 
  CreditBalance, 
  TransactionId, 
  TransactionResult,
  CreditDomainService 
} from "../../domain/CreditAggregate";

// Command Pattern for CQRS
export interface ImageGenerationCommand {
  userId: number;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: string;
  numImages: number;
}

export interface ImageGenerationResult {
  success: boolean;
  images?: any[];
  requestId?: string;
  creditsUsed?: number;
  newBalance?: number;
  error?: string;
  message?: string;
  required?: number;
  available?: number;
  statusCode?: number;
}

// Repository Interfaces (Dependency Inversion Principle)
export interface ICreditRepository {
  getCreditAccount(userId: number): Promise<CreditAccount>;
  saveCreditAccount(account: CreditAccount): Promise<void>;
  recordTransaction(userId: number, transactionId: string, type: string, amount: number, description: string, balanceAfter: number): Promise<void>;
}

export interface IImageGenerationRepository {
  generateImages(request: any): Promise<any[]>;
  saveImage(image: any): Promise<any>;
}

// Repository Implementations
export class DatabaseCreditRepository implements ICreditRepository {
  async getCreditAccount(userId: number): Promise<CreditAccount> {
    const result = await pool.query(
      'SELECT amount, version, created_at, last_updated FROM credit_balances WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create new account with initial balance
      const newAccount = CreditAccount.create(userId, 20);
      await this.saveCreditAccount(newAccount);
      return newAccount;
    }

    const row = result.rows[0];
    return CreditAccount.restore(
      userId,
      parseFloat(row.amount),
      row.version || 1,
      row.created_at || new Date(),
      row.last_updated || new Date()
    );
  }

  async saveCreditAccount(account: CreditAccount): Promise<void> {
    await pool.query(
      `INSERT INTO credit_balances (user_id, amount, version, created_at, last_updated) 
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET amount = $2, version = $3, last_updated = NOW()`,
      [account.userId, account.balance.amount.toString(), account.version]
    );
  }

  async recordTransaction(
    userId: number, 
    transactionId: string, 
    type: string, 
    amount: number, 
    description: string, 
    balanceAfter: number
  ): Promise<void> {
    await pool.query(
      'INSERT INTO credit_transactions (id, user_id, type, amount, description, balance_after, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [
        transactionId,
        userId,
        type,
        type === 'SPEND' ? (-amount).toString() : amount.toString(),
        description,
        balanceAfter.toString()
      ]
    );
  }
}

export class RunwareImageRepository implements IImageGenerationRepository {
  async generateImages(request: any): Promise<any[]> {
    const { RunwareImageGenerationService } = await import("../../infrastructure/services/RunwareImageGenerationService");
    const imageService = new RunwareImageGenerationService();
    
    return await imageService.generateImages({
      prompt: request.prompt,
      negativePrompt: request.negativePrompt,
      aspectRatio: request.aspectRatio,
      numImages: request.numImages
    });
  }

  async saveImage(imageData: any): Promise<any> {
    return await storage.createImage(imageData);
  }
}

// Application Service (SOLID Principles)
export class CreditTransactionService {
  private creditRepo: ICreditRepository;
  private imageRepo: IImageGenerationRepository;
  private domainService: CreditDomainService;

  constructor(
    creditRepo?: ICreditRepository,
    imageRepo?: IImageGenerationRepository
  ) {
    // Dependency Injection with defaults (Dependency Inversion Principle)
    this.creditRepo = creditRepo || new DatabaseCreditRepository();
    this.imageRepo = imageRepo || new RunwareImageRepository();
    this.domainService = new CreditDomainService();
  }

  /**
   * Apple Design Philosophy: "Every interaction should feel natural and immediate"
   * Executes atomic credit transaction with image generation
   */
  async executeImageGenerationTransaction(command: ImageGenerationCommand): Promise<ImageGenerationResult> {
    try {
      // 1. Validate domain rules
      this.domainService.validateImageGenerationRequest(command.prompt, command.aspectRatio, command.numImages);
      
      // 2. Calculate cost using domain service
      const costAmount = this.domainService.calculateImageGenerationCost(command.aspectRatio, command.numImages);
      
      // 3. Load credit account aggregate
      const creditAccount = await this.creditRepo.getCreditAccount(command.userId);
      
      // 4. Attempt to deduct credits (business logic in domain)
      const deductResult = creditAccount.deductCredits(
        costAmount, 
        `Generated ${command.numImages} image(s) with ${command.aspectRatio} aspect ratio`
      );
      
      if (!deductResult.success) {
        return {
          success: false,
          error: "Insufficient credits",
          message: deductResult.errorMessage,
          required: deductResult.requiredAmount,
          available: deductResult.availableAmount,
          statusCode: 402
        };
      }

      // 5. Persist credit account changes
      await this.creditRepo.saveCreditAccount(creditAccount);
      
      // 6. Record transaction
      await this.creditRepo.recordTransaction(
        command.userId,
        deductResult.transactionId!.value,
        'SPEND',
        costAmount,
        `Generated ${command.numImages} image(s) with ${command.aspectRatio} aspect ratio`,
        deductResult.newBalance!.amount
      );

      try {
        // 7. Generate images
        const generatedImages = await this.imageRepo.generateImages(command);

        // 8. Save images to user gallery
        const savedImages = [];
        for (const image of generatedImages) {
          const savedImage = await this.imageRepo.saveImage({
            userId: command.userId,
            modelId: "runware:100@1",
            prompt: command.prompt,
            negativePrompt: command.negativePrompt || "",
            imageUrl: image.url,
            aspectRatio: command.aspectRatio,
            fileName: image.fileName,
            fileSize: image.fileSize,
            seed: image.seed
          });
          savedImages.push(savedImage);
        }

        // Clear domain events after successful processing
        creditAccount.clearEvents();

        return {
          success: true,
          images: savedImages,
          requestId: `req_${Date.now()}`,
          creditsUsed: costAmount,
          newBalance: deductResult.newBalance!.amount
        };

      } catch (generationError: any) {
        // 9. Refund credits if generation fails (Compensation Pattern)
        const refundResult = creditAccount.refundCredits(costAmount, "Image generation failed");
        await this.creditRepo.saveCreditAccount(creditAccount);
        
        if (refundResult.success) {
          await this.creditRepo.recordTransaction(
            command.userId,
            refundResult.transactionId!.value,
            'REFUND',
            costAmount,
            "Refund: Image generation failed",
            refundResult.newBalance!.amount
          );
        }
        
        return {
          success: false,
          error: "Image generation failed",
          message: generationError.message || "Generation service unavailable",
          statusCode: 500
        };
      }

    } catch (error: any) {
      console.error("Credit transaction service error:", error);
      return {
        success: false,
        error: "Transaction failed",
        message: error.message || "An unexpected error occurred",
        statusCode: 500
      };
    }
  }
}