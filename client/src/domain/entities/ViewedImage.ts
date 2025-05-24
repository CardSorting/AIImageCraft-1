/**
 * Domain Entity: ViewedImage
 * Represents an image that has been viewed by a user
 * Following DDD principles - rich domain model with business logic
 */

export interface ViewedImageData {
  id: number;
  viewedAt: Date;
  sessionId: string;
  userId?: number;
}

export class ViewedImage {
  private constructor(
    private readonly _id: number,
    private readonly _viewedAt: Date,
    private readonly _sessionId: string,
    private readonly _userId?: number
  ) {}

  static create(data: ViewedImageData): ViewedImage {
    return new ViewedImage(
      data.id,
      data.viewedAt,
      data.sessionId,
      data.userId
    );
  }

  get id(): number {
    return this._id;
  }

  get viewedAt(): Date {
    return this._viewedAt;
  }

  get sessionId(): string {
    return this._sessionId;
  }

  get userId(): number | undefined {
    return this._userId;
  }

  // Domain logic: Check if image was viewed recently (within last hour)
  isViewedRecently(): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this._viewedAt > oneHourAgo;
  }

  // Domain logic: Check if belongs to current session
  belongsToSession(sessionId: string): boolean {
    return this._sessionId === sessionId;
  }

  // Domain logic: Check if belongs to user
  belongsToUser(userId: number): boolean {
    return this._userId === userId;
  }
}