/**
 * Dependency Injection Container
 * Implements Inversion of Control following SOLID principles
 */

import { Pool } from 'pg';
import { CreditService } from '../application/services/CreditService';
import { ICreditRepository } from '../domain/repositories/ICreditRepository';
import { PostgresCreditRepository } from './repositories/PostgresCreditRepository';
import { IPaymentService } from './services/IPaymentService';
import { StripePaymentService } from './services/StripePaymentService';
import { IEventPublisher } from './events/IEventPublisher';
import { EventPublisher } from './events/EventPublisher';
import { CreditController } from '../presentation/controllers/CreditController';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  configure(dbPool: Pool): void {
    // Infrastructure services
    this.services.set('dbPool', dbPool);
    
    // Event system
    const eventPublisher = new EventPublisher();
    this.services.set('eventPublisher', eventPublisher);

    // Payment service
    if (process.env.STRIPE_SECRET_KEY) {
      const paymentService = new StripePaymentService(process.env.STRIPE_SECRET_KEY);
      this.services.set('paymentService', paymentService);
    } else {
      console.warn('STRIPE_SECRET_KEY not configured - payment functionality will be limited');
    }

    // Repository
    const creditRepository = new PostgresCreditRepository(dbPool);
    this.services.set('creditRepository', creditRepository);

    // Application services
    const creditService = new CreditService(
      creditRepository,
      this.get('paymentService'),
      eventPublisher
    );
    this.services.set('creditService', creditService);

    // Controllers
    const creditController = new CreditController(creditService);
    this.services.set('creditController', creditController);

    console.log('✅ Dependency container configured successfully');
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }
}