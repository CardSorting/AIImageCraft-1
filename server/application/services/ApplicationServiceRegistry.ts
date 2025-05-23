/**
 * Application Service Registry - Dependency Injection Container
 * Following Apple's philosophy of seamless service coordination
 * Implements Clean Architecture with proper dependency management
 */

import { IStorage } from '../../storage';
import { PersonalizationEngine } from '../../domain/services/PersonalizationEngine';
import { TrackUserInteractionCommandHandler } from '../handlers/TrackUserInteractionCommandHandler';
import { EnhancedModelRepository } from '../../infrastructure/repositories/EnhancedModelRepository';

/**
 * Central service registry for dependency injection
 * Apple-style service coordination
 */
export class ApplicationServiceRegistry {
  private static instance: ApplicationServiceRegistry;
  
  private _personalizationEngine?: PersonalizationEngine;
  private _interactionHandler?: TrackUserInteractionCommandHandler;
  private _modelRepository?: EnhancedModelRepository;

  private constructor(private readonly storage: IStorage) {}

  /**
   * Get singleton instance
   */
  static getInstance(storage: IStorage): ApplicationServiceRegistry {
    if (!ApplicationServiceRegistry.instance) {
      ApplicationServiceRegistry.instance = new ApplicationServiceRegistry(storage);
    }
    return ApplicationServiceRegistry.instance;
  }

  /**
   * Get personalization engine
   */
  getPersonalizationEngine(): PersonalizationEngine {
    if (!this._personalizationEngine) {
      this._personalizationEngine = new PersonalizationEngine();
    }
    return this._personalizationEngine;
  }

  /**
   * Get interaction command handler
   */
  getInteractionHandler(): TrackUserInteractionCommandHandler {
    if (!this._interactionHandler) {
      this._interactionHandler = new TrackUserInteractionCommandHandler(this.storage);
    }
    return this._interactionHandler;
  }

  /**
   * Get enhanced model repository
   */
  getModelRepository(): EnhancedModelRepository {
    if (!this._modelRepository) {
      this._modelRepository = new EnhancedModelRepository();
    }
    return this._modelRepository;
  }
}