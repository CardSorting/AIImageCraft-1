// Domain Entity - Image Edit Session following DDD principles
export interface SessionId {
  value: string;
}

export interface ImageData {
  url: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface EditInstruction {
  prompt: string;
  timestamp: Date;
}

export class ImageEditSession {
  private readonly _messages: Message[] = [];
  
  constructor(
    public readonly id: SessionId,
    public readonly originalImage: ImageData,
    private _currentImage: ImageData,
    private _isActive: boolean = true
  ) {}

  public static create(imageData: ImageData): ImageEditSession {
    const sessionId = { value: crypto.randomUUID() };
    return new ImageEditSession(sessionId, imageData, imageData);
  }

  public addMessage(message: Message): void {
    this._messages.push(message);
  }

  public updateCurrentImage(imageData: ImageData): void {
    this._currentImage = imageData;
  }

  public getCurrentImage(): ImageData {
    return this._currentImage;
  }

  public getMessages(): ReadonlyArray<Message> {
    return [...this._messages];
  }

  public isActive(): boolean {
    return this._isActive;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public getLastEditInstruction(): EditInstruction | null {
    const userMessages = this._messages
      .filter(m => m.isFromUser())
      .sort((a, b) => b.timestamp.value.getTime() - a.timestamp.value.getTime());
    
    if (userMessages.length === 0) return null;
    
    const lastMessage = userMessages[0];
    return {
      prompt: lastMessage.content.text,
      timestamp: lastMessage.timestamp.value
    };
  }

  public hasMessages(): boolean {
    return this._messages.length > 0;
  }
}

import { Message } from './Message';