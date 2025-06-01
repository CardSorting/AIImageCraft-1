// Application Layer - Command following CQRS pattern
import { EditRequest } from '../../../domain/ai-designer/value-objects/EditRequest';
import { Message } from '../../../domain/ai-designer/entities/Message';
import { ImageEditSession } from '../../../domain/ai-designer/entities/ImageEditSession';

export interface EditImageCommand {
  sessionId: string;
  promptText: string;
  imageUrl: string;
  userId?: string;
}

export interface EditImageCommandResult {
  success: boolean;
  sessionId: string;
  messageId: string;
  editedImageUrl?: string;
  error?: string;
}

// Command Handler - Single Responsibility Principle
export interface IEditImageCommandHandler {
  handle(command: EditImageCommand): Promise<EditImageCommandResult>;
}

export class EditImageCommandHandler implements IEditImageCommandHandler {
  constructor(
    private readonly imageEditService: import('../../../domain/ai-designer/services/IImageEditService').IImageEditService,
    private readonly sessionRepository: ISessionRepository,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async handle(command: EditImageCommand): Promise<EditImageCommandResult> {
    try {
      // Create edit request using domain value objects
      const editRequest = EditRequest.create(command.promptText, command.imageUrl);
      
      // Get or create session
      let session = await this.sessionRepository.findById(command.sessionId);
      if (!session) {
        const imageData = { url: command.imageUrl };
        session = ImageEditSession.create(imageData);
        await this.sessionRepository.save(session);
      }

      // Create user message
      const userMessage = Message.create('user', command.promptText, command.imageUrl);
      session.addMessage(userMessage);

      // Create pending assistant message
      const assistantMessage = Message.createPending('assistant', 'Processing your edit request...');
      session.addMessage(assistantMessage);

      // Publish domain event
      await this.eventPublisher.publish({
        eventId: crypto.randomUUID(),
        eventType: 'ImageEditStarted',
        occurredOn: new Date(),
        data: {
          requestId: editRequest.requestId,
          prompt: command.promptText
        }
      });

      // Execute image edit
      const result = await this.imageEditService.editImage(editRequest);

      if (result.success && result.imageData) {
        // Update session with result
        session.updateCurrentImage(result.imageData);
        
        // Update assistant message with success
        const updatedMessage = assistantMessage
          .withImageUrl(result.imageData.url)
          .withContent("Here's your edited image! What would you like me to adjust next?")
          .withStatus('completed');
        
        await this.sessionRepository.save(session);

        await this.eventPublisher.publish({
          eventId: crypto.randomUUID(),
          eventType: 'ImageEditCompleted',
          occurredOn: new Date(),
          data: {
            requestId: editRequest.requestId,
            resultImageUrl: result.imageData.url
          }
        });

        return {
          success: true,
          sessionId: session.id.value,
          messageId: updatedMessage.id.value,
          editedImageUrl: result.imageData.url
        };
      } else {
        // Handle failure
        const errorMessage = assistantMessage
          .withContent(result.error || "I encountered an error while editing your image.")
          .withStatus('error');

        await this.sessionRepository.save(session);

        await this.eventPublisher.publish({
          eventId: crypto.randomUUID(),
          eventType: 'ImageEditFailed',
          occurredOn: new Date(),
          data: {
            requestId: editRequest.requestId,
            error: result.error || 'Unknown error'
          }
        });

        return {
          success: false,
          sessionId: session.id.value,
          messageId: errorMessage.id.value,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        sessionId: command.sessionId,
        messageId: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Repository interfaces - Dependency Inversion Principle
export interface ISessionRepository {
  findById(id: string): Promise<ImageEditSession | null>;
  save(session: ImageEditSession): Promise<void>;
  findByUserId(userId: string): Promise<ImageEditSession[]>;
}

export interface IEventPublisher {
  publish(event: import('../../../domain/ai-designer/services/IImageEditService').DomainEvent): Promise<void>;
}