// Application Use Case: Edit Image
// Orchestrates domain services and infrastructure
// Follows CQRS pattern and Clean Architecture

import { EditRequest, EditResult, IImageEditService } from '../../../domain/ai-designer/services/ImageEditService';
import { IChatRepository } from '../../../domain/ai-designer/repositories/IChatRepository';
import { ChatMessageEntity } from '../../../domain/ai-designer/entities/ChatMessage';

export interface IImageEditApiService {
  editImage(request: EditRequest): Promise<EditResult>;
}

export class EditImageUseCase {
  constructor(
    private readonly imageEditService: IImageEditService,
    private readonly chatRepository: IChatRepository,
    private readonly apiService: IImageEditApiService
  ) {}

  async execute(
    prompt: string,
    imageUrl: string,
    sessionId: string = 'default'
  ): Promise<EditResult> {
    try {
      // 1. Detect edit type using domain service
      const editType = this.imageEditService.detectEditType(prompt);

      // 2. Create edit request
      const editRequest: EditRequest = {
        prompt: this.imageEditService.formatPromptForAPI(prompt, editType),
        imageUrl,
        editType,
      };

      // 3. Validate request
      const isValid = await this.imageEditService.validateEditRequest(editRequest);
      if (!isValid) {
        throw new Error('Invalid edit request');
      }

      // 4. Save user message
      const userMessage = ChatMessageEntity.createUserMessage(prompt);
      await this.chatRepository.saveMessage(userMessage.toPlainObject());

      // 5. Save processing message
      const processingMessage = ChatMessageEntity.createProcessingMessage();
      await this.chatRepository.saveMessage(processingMessage.toPlainObject());

      // 6. Call API service
      const result = await this.apiService.editImage(editRequest);

      // 7. Update processing message with result
      if (result.success && result.imageUrl) {
        const completedMessage = processingMessage
          .withStatus('completed')
          .withImage(result.imageUrl)
          .withContent("Here's your edited image! What would you like me to adjust next?");
        
        await this.chatRepository.updateMessage(
          processingMessage.toPlainObject().id,
          completedMessage.toPlainObject()
        );
      } else {
        const errorMessage = processingMessage
          .withStatus('error')
          .withContent(result.error || 'Sorry, I encountered an error while editing your image.');
        
        await this.chatRepository.updateMessage(
          processingMessage.toPlainObject().id,
          errorMessage.toPlainObject()
        );
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }
}