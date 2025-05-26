/**
 * Model Mapper - Data Transformation Layer
 * Following Apple's philosophy of clean, predictable transformations
 * Handles conversion between API data and domain entities
 */

import { Model } from '@/domain/entities/Model';

export class ModelMapper {
  static transformToModels(rawModels: any[]): Model[] {
    return rawModels.map(raw => new Model(
      raw.id,
      raw.modelId,
      raw.name,
      raw.description,
      raw.imageUrl,
      {
        version: raw.version || '1.0',
        lastUpdated: new Date(raw.updatedAt || Date.now()),
        provider: raw.provider || 'Unknown',
        category: raw.category || 'General',
        tags: raw.tags || [],
        featured: raw.featured || false
      },
      {
        supportedStyles: raw.capabilities?.supportedStyles || [],
        maxResolution: raw.capabilities?.maxResolution || '1024x1024',
        averageGenerationTime: raw.capabilities?.averageGenerationTime || 5,
        qualityRating: raw.qualityRating || 80
      },
      {
        likeCount: raw.likeCount || 0,
        bookmarkCount: raw.bookmarkCount || 0,
        downloadCount: raw.downloads || 0,
        viewCount: raw.views || 0,
        engagementScore: raw.engagementScore || 50
      }
    ));
  }

  static transformToModel(raw: any): Model {
    return this.transformToModels([raw])[0];
  }
}