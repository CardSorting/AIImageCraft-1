// Domain Entity: ChatMessage
// Follows DDD principles with rich domain model

export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'pending' | 'completed' | 'error';
export type EditType = 'enhance' | 'style' | 'background' | 'object' | 'color';

export interface ChatMessage {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly imageUrl?: string;
  readonly originalImageUrl?: string;
  readonly timestamp: Date;
  readonly status?: MessageStatus;
  readonly editType?: EditType;
}

export class ChatMessageEntity {
  constructor(
    private readonly id: string,
    private readonly role: MessageRole,
    private readonly content: string,
    private readonly timestamp: Date,
    private readonly imageUrl?: string,
    private readonly originalImageUrl?: string,
    private readonly status?: MessageStatus,
    private readonly editType?: EditType
  ) {}

  // Business logic methods
  isFromUser(): boolean {
    return this.role === 'user';
  }

  isFromAssistant(): boolean {
    return this.role === 'assistant';
  }

  hasImage(): boolean {
    return !!this.imageUrl;
  }

  isProcessing(): boolean {
    return this.status === 'pending';
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  hasError(): boolean {
    return this.status === 'error';
  }

  canDownload(): boolean {
    return this.isFromAssistant() && this.hasImage() && this.isCompleted();
  }

  getFormattedTime(): string {
    return this.timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Factory methods
  static createUserMessage(content: string, imageUrl?: string): ChatMessageEntity {
    return new ChatMessageEntity(
      Date.now().toString(),
      'user',
      content,
      new Date(),
      imageUrl
    );
  }

  static createAssistantMessage(content: string): ChatMessageEntity {
    return new ChatMessageEntity(
      Date.now().toString(),
      'assistant',
      content,
      new Date()
    );
  }

  static createProcessingMessage(): ChatMessageEntity {
    return new ChatMessageEntity(
      'temp-processing',
      'assistant',
      "I'm working on your edit request...",
      new Date(),
      undefined,
      undefined,
      'pending'
    );
  }

  // Convert to plain object for state management
  toPlainObject(): ChatMessage {
    return {
      id: this.id,
      role: this.role,
      content: this.content,
      imageUrl: this.imageUrl,
      originalImageUrl: this.originalImageUrl,
      timestamp: this.timestamp,
      status: this.status,
      editType: this.editType,
    };
  }

  // Update methods (returns new instance - immutable)
  withStatus(status: MessageStatus): ChatMessageEntity {
    return new ChatMessageEntity(
      this.id,
      this.role,
      this.content,
      this.timestamp,
      this.imageUrl,
      this.originalImageUrl,
      status,
      this.editType
    );
  }

  withImage(imageUrl: string): ChatMessageEntity {
    return new ChatMessageEntity(
      this.id,
      this.role,
      this.content,
      this.timestamp,
      imageUrl,
      this.originalImageUrl,
      this.status,
      this.editType
    );
  }

  withContent(content: string): ChatMessageEntity {
    return new ChatMessageEntity(
      this.id,
      this.role,
      content,
      this.timestamp,
      this.imageUrl,
      this.originalImageUrl,
      this.status,
      this.editType
    );
  }
}