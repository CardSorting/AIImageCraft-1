import { ImageGenerationAggregateRepository } from '../repositories/ImageGenerationAggregateRepository';
import { RunwareImageGenerationAdapter } from '../adapters/RunwareImageGenerationAdapter';
import { GenerateImageUseCase } from '../../application/use-cases/GenerateImageUseCase';
import { GetImageHistoryUseCase } from '../../application/use-cases/GetImageHistoryUseCase';
import { IImageGenerationAggregateRepository } from '../../domain/repositories/IImageGenerationAggregateRepository';
import { IImageGenerationService } from '../../domain/services/IImageGenerationService';

/**
 * Clean Architecture Dependency Container
 * Implements Dependency Inversion Principle
 * Follows Apple's philosophy of elegant, maintainable design
 */
export class CleanArchitectureContainer {
  private static instance: CleanArchitectureContainer;
  
  // Domain layer dependencies
  private _imageAggregateRepository: IImageGenerationAggregateRepository;
  private _imageGenerationService: IImageGenerationService;
  
  // Application layer dependencies
  private _generateImageUseCase: GenerateImageUseCase;
  private _getImageHistoryUseCase: GetImageHistoryUseCase;

  private constructor() {
    // Infrastructure layer (adapters and repositories)
    this._imageAggregateRepository = new ImageGenerationAggregateRepository();
    this._imageGenerationService = new RunwareImageGenerationAdapter();
    
    // Application layer (use cases with injected dependencies)
    this._generateImageUseCase = new GenerateImageUseCase(
      this._imageAggregateRepository,
      this._imageGenerationService
    );
    
    this._getImageHistoryUseCase = new GetImageHistoryUseCase(
      this._imageAggregateRepository
    );
  }

  public static getInstance(): CleanArchitectureContainer {
    if (!CleanArchitectureContainer.instance) {
      CleanArchitectureContainer.instance = new CleanArchitectureContainer();
    }
    return CleanArchitectureContainer.instance;
  }

  // Clean getters following Single Responsibility Principle
  public get imageAggregateRepository(): IImageGenerationAggregateRepository {
    return this._imageAggregateRepository;
  }

  public get imageGenerationService(): IImageGenerationService {
    return this._imageGenerationService;
  }

  public get generateImageUseCase(): GenerateImageUseCase {
    return this._generateImageUseCase;
  }

  public get getImageHistoryUseCase(): GetImageHistoryUseCase {
    return this._getImageHistoryUseCase;
  }
}