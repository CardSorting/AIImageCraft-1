// Domain Service: Image Edit Service
// Implements business logic for image editing operations
// Follows Single Responsibility Principle

import { EditType } from '../entities/ChatMessage';

export interface EditRequest {
  readonly prompt: string;
  readonly imageUrl: string;
  readonly editType: EditType;
}

export interface EditResult {
  readonly success: boolean;
  readonly imageUrl?: string;
  readonly error?: string;
}

export interface IImageEditService {
  detectEditType(prompt: string): EditType;
  validateEditRequest(request: EditRequest): Promise<boolean>;
  formatPromptForAPI(prompt: string, editType: EditType): string;
}

export class ImageEditService implements IImageEditService {
  
  // Business rule: Detect the type of edit based on prompt content
  detectEditType(prompt: string): EditType {
    const lowerPrompt = prompt.toLowerCase();
    
    // Priority-based detection for better accuracy
    if (this.isBackgroundEdit(lowerPrompt)) {
      return 'background';
    } else if (this.isStyleEdit(lowerPrompt)) {
      return 'style';
    } else if (this.isColorEdit(lowerPrompt)) {
      return 'color';
    } else if (this.isObjectEdit(lowerPrompt)) {
      return 'object';
    } else {
      return 'enhance';
    }
  }

  private isBackgroundEdit(prompt: string): boolean {
    const backgroundKeywords = [
      'background', 'sky', 'scene', 'setting', 'environment',
      'backdrop', 'landscape', 'surroundings'
    ];
    return backgroundKeywords.some(keyword => prompt.includes(keyword));
  }

  private isStyleEdit(prompt: string): boolean {
    const styleKeywords = [
      'style', 'painting', 'artistic', 'watercolor', 'oil painting',
      'sketch', 'cartoon', 'anime', 'realistic', 'abstract'
    ];
    return styleKeywords.some(keyword => prompt.includes(keyword));
  }

  private isColorEdit(prompt: string): boolean {
    const colorKeywords = [
      'color', 'tone', 'hue', 'saturation', 'brightness',
      'vibrant', 'darker', 'lighter', 'warm', 'cool'
    ];
    return colorKeywords.some(keyword => prompt.includes(keyword));
  }

  private isObjectEdit(prompt: string): boolean {
    const objectKeywords = [
      'add', 'remove', 'delete', 'object', 'person', 'item',
      'element', 'thing', 'replace', 'substitute'
    ];
    return objectKeywords.some(keyword => prompt.includes(keyword));
  }

  // Business rule: Validate edit request before processing
  async validateEditRequest(request: EditRequest): Promise<boolean> {
    if (!request.prompt.trim()) {
      return false;
    }

    if (!request.imageUrl) {
      return false;
    }

    if (request.prompt.length > 500) {
      return false;
    }

    // Validate image URL is accessible
    try {
      const response = await fetch(request.imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Business rule: Format prompt for optimal API results
  formatPromptForAPI(prompt: string, editType: EditType): string {
    const basePrompt = prompt.trim();
    
    switch (editType) {
      case 'background':
        return `Change the background: ${basePrompt}`;
      case 'style':
        return `Apply artistic style: ${basePrompt}`;
      case 'color':
        return `Adjust colors: ${basePrompt}`;
      case 'object':
        return `Modify objects: ${basePrompt}`;
      case 'enhance':
      default:
        return `Enhance image: ${basePrompt}`;
    }
  }
}