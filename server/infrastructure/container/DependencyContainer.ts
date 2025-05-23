import { DatabaseImageGenerationRepository } from '../repositories/DatabaseImageGenerationRepository';
import { FalAiImageGenerationService } from '../services/FalAiImageGenerationService';
import { EnhancedBackblazeB2Service } from '../services/EnhancedBackblazeB2Service';
import { GenerateImagesCommandHandler } from '../../application/handlers/GenerateImagesCommandHandler';
import { GetImagesQueryHandler } from '../../application/handlers/GetImagesQueryHandler';
import { IImageGenerationRepository } from '../../domain/repositories/IImageGenerationRepository';
import { IImageGenerationService } from '../../domain/services/IImageGenerationService';
import { ICloudStorageService } from '../../domain/services/ICloudStorageService';

export class DependencyContainer {
  private static instance: DependencyContainer;
  
  // Repositories
  private _imageRepository: IImageGenerationRepository;
  
  // Services
  private _imageGenerationService: IImageGenerationService;
  private _cloudStorageService: ICloudStorageService;
  
  // Handlers
  private _generateImagesCommandHandler: GenerateImagesCommandHandler;
  private _getImagesQueryHandler: GetImagesQueryHandler;

  private constructor() {
    // Initialize dependencies following dependency inversion principle
    this._imageRepository = new DatabaseImageGenerationRepository();
    this._imageGenerationService = new FalAiImageGenerationService();
    this._cloudStorageService = new EnhancedBackblazeB2Service();
    
    // Initialize handlers with injected dependencies
    this._generateImagesCommandHandler = new GenerateImagesCommandHandler(
      this._imageGenerationService,
      this._imageRepository,
      this._cloudStorageService
    );
    
    this._getImagesQueryHandler = new GetImagesQueryHandler(
      this._imageRepository
    );
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  // Getters for dependency injection
  public get imageRepository(): IImageGenerationRepository {
    return this._imageRepository;
  }

  public get imageGenerationService(): IImageGenerationService {
    return this._imageGenerationService;
  }

  public get cloudStorageService(): ICloudStorageService {
    return this._cloudStorageService;
  }

  public get generateImagesCommandHandler(): GenerateImagesCommandHandler {
    return this._generateImagesCommandHandler;
  }

  public get getImagesQueryHandler(): GetImagesQueryHandler {
    return this._getImagesQueryHandler;
  }
}