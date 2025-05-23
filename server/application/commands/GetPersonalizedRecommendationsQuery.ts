/**
 * Get Personalized Recommendations Query - CQRS Pattern
 * Following Apple's philosophy of intuitive, seamless experiences
 * Implements Clean Architecture separation of concerns
 */

export class GetPersonalizedRecommendationsQuery {
  constructor(
    public readonly userId: number,
    public readonly maxResults: number = 20,
    public readonly excludeModelIds: number[] = [],
    public readonly includeReasons: boolean = true,
    public readonly sessionContext: SessionContextData = {},
    public readonly requestedAt: Date = new Date()
  ) {}
}

export interface SessionContextData {
  readonly sessionDuration?: number; // minutes
  readonly pagesViewed?: string[];
  readonly modelsViewed?: number[];
  readonly searchQueries?: string[];
  readonly currentCategory?: string;
  readonly deviceType?: 'mobile' | 'tablet' | 'desktop';
  readonly userAgent?: string;
}