// Infrastructure Service: FLUX Kontext API Service
// Implements the external API interface for image editing
// Follows Dependency Inversion Principle

import { EditRequest, EditResult } from '../../domain/ai-designer/services/ImageEditService';
import { IImageEditApiService } from '../../application/ai-designer/usecases/EditImageUseCase';

export class FluxKontextApiService implements IImageEditApiService {
  
  async editImage(request: EditRequest): Promise<EditResult> {
    try {
      // Create FormData for the existing FLUX Kontext endpoint
      const formData = new FormData();
      
      // Convert image URL to blob
      const imageResponse = await fetch(request.imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch source image');
      }
      
      const imageBlob = await imageResponse.blob();
      formData.append('image', imageBlob, 'edit-image.jpg');
      formData.append('prompt', request.prompt);
      formData.append('editType', request.editType);

      // Call the existing cosplay endpoint which uses FLUX Kontext
      const response = await fetch('/api/generate-cosplay', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Handle different response formats
      if (data.success === false) {
        return {
          success: false,
          error: data.error || 'Unknown API error',
        };
      }

      // Extract image URL from response
      let imageUrl: string | undefined;
      
      if (data.images && data.images.length > 0) {
        imageUrl = data.images[0].imageUrl;
      } else if (data.imageUrl) {
        imageUrl = data.imageUrl;
      } else if (data.url) {
        imageUrl = data.url;
      }

      if (!imageUrl) {
        return {
          success: false,
          error: 'No image URL returned from API',
        };
      }

      return {
        success: true,
        imageUrl,
      };

    } catch (error) {
      console.error('FLUX Kontext API Error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to edit image',
      };
    }
  }
}