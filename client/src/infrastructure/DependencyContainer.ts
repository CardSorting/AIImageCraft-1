/**
 * Dependency Injection Container
 * Following Dependency Inversion Principle (DIP) and Inversion of Control (IoC)
 * Centralized dependency management for Clean Architecture
 */

import { LocalStorageImageFeedRepository } from "./repositories/LocalStorageImageFeedRepository";
import { CryptoRandomizationService } from "./services/CryptoRandomizationService";
import { ImageFeedApplicationService } from "../application/services/ImageFeedApplicationService";
import { type IImageFeedRepository } from "../domain/repositories/IImageFeedRepository";
import { type IRandomizationService } from "../domain/services/IRandomizationService";

export class DependencyContainer {
  private static instance: DependencyContainer;
  
  private _imageRepository?: IImageFeedRepository;
  private _randomizationService?: IRandomizationService;
  private _imageFeedService?: ImageFeedApplicationService;

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  getImageRepository(): IImageFeedRepository {
    if (!this._imageRepository) {
      this._imageRepository = new LocalStorageImageFeedRepository();
    }
    return this._imageRepository;
  }

  getRandomizationService(): IRandomizationService {
    if (!this._randomizationService) {
      this._randomizationService = new CryptoRandomizationService();
    }
    return this._randomizationService;
  }

  getImageFeedService(): ImageFeedApplicationService {
    if (!this._imageFeedService) {
      this._imageFeedService = new ImageFeedApplicationService(
        this.getImageRepository(),
        this.getRandomizationService()
      );
    }
    return this._imageFeedService;
  }

  // For testing or different configurations
  setImageRepository(repository: IImageFeedRepository): void {
    this._imageRepository = repository;
    this._imageFeedService = undefined; // Reset service to use new repository
  }

  setRandomizationService(service: IRandomizationService): void {
    this._randomizationService = service;
    this._imageFeedService = undefined; // Reset service to use new randomization
  }
}