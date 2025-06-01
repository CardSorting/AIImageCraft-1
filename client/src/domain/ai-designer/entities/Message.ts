// Domain Entity - Pure business logic with no external dependencies
export interface MessageId {
  value: string;
}

export interface MessageContent {
  text: string;
  imageUrl?: string;
}

export interface MessageTimestamp {
  value: Date;
}

export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'pending' | 'completed' | 'error';

export class Message {
  constructor(
    public readonly id: MessageId,
    public readonly role: MessageRole,
    public readonly content: MessageContent,
    public readonly timestamp: MessageTimestamp,
    public readonly status: MessageStatus
  ) {}

  public static create(
    role: MessageRole,
    text: string,
    imageUrl?: string
  ): Message {
    return new Message(
      { value: Date.now().toString() },
      role,
      { text, imageUrl },
      { value: new Date() },
      'completed'
    );
  }

  public static createPending(role: MessageRole, text: string): Message {
    return new Message(
      { value: 'temp-processing' },
      role,
      { text },
      { value: new Date() },
      'pending'
    );
  }

  public withImageUrl(imageUrl: string): Message {
    return new Message(
      this.id,
      this.role,
      { ...this.content, imageUrl },
      this.timestamp,
      this.status
    );
  }

  public withStatus(status: MessageStatus): Message {
    return new Message(
      this.id,
      this.role,
      this.content,
      this.timestamp,
      status
    );
  }

  public withContent(text: string): Message {
    return new Message(
      this.id,
      this.role,
      { ...this.content, text },
      this.timestamp,
      this.status
    );
  }

  public isFromUser(): boolean {
    return this.role === 'user';
  }

  public isFromAssistant(): boolean {
    return this.role === 'assistant';
  }

  public isPending(): boolean {
    return this.status === 'pending';
  }

  public hasImage(): boolean {
    return Boolean(this.content.imageUrl);
  }
}