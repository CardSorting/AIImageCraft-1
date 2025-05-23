/**
 * Storage Operation Domain Entity
 * Encapsulates storage operations with Apple-like attention to detail
 */

export interface StorageOperationProps {
  id?: string;
  sourceUrl: string;
  targetFileName?: string;
  status: StorageOperationStatus;
  uploadId?: string;
  resultUrl?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  completedAt?: Date;
}

export enum StorageOperationStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export class StorageOperation {
  private constructor(private props: Required<StorageOperationProps>) {}

  static create(props: Omit<StorageOperationProps, 'id' | 'createdAt'>): StorageOperation {
    return new StorageOperation({
      id: this.generateId(),
      createdAt: new Date(),
      completedAt: new Date(0), // Will be updated when completed
      ...props
    });
  }

  static fromPersistence(props: Required<StorageOperationProps>): StorageOperation {
    return new StorageOperation(props);
  }

  private static generateId(): string {
    return `storage_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  // Getters
  get id(): string { return this.props.id; }
  get sourceUrl(): string { return this.props.sourceUrl; }
  get targetFileName(): string | undefined { return this.props.targetFileName; }
  get status(): StorageOperationStatus { return this.props.status; }
  get uploadId(): string | undefined { return this.props.uploadId; }
  get resultUrl(): string | undefined { return this.props.resultUrl; }
  get errorMessage(): string | undefined { return this.props.errorMessage; }
  get metadata(): Record<string, any> | undefined { return this.props.metadata; }
  get createdAt(): Date { return this.props.createdAt; }
  get completedAt(): Date { return this.props.completedAt; }

  // Domain methods
  markAsDownloading(): void {
    this.props.status = StorageOperationStatus.DOWNLOADING;
  }

  markAsUploading(uploadId: string): void {
    this.props.status = StorageOperationStatus.UPLOADING;
    this.props.uploadId = uploadId;
  }

  markAsCompleted(resultUrl: string): void {
    this.props.status = StorageOperationStatus.COMPLETED;
    this.props.resultUrl = resultUrl;
    this.props.completedAt = new Date();
  }

  markAsFailed(errorMessage: string): void {
    this.props.status = StorageOperationStatus.FAILED;
    this.props.errorMessage = errorMessage;
    this.props.completedAt = new Date();
  }

  isCompleted(): boolean {
    return this.props.status === StorageOperationStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.props.status === StorageOperationStatus.FAILED;
  }

  getDurationMs(): number {
    if (this.props.completedAt.getTime() === 0) {
      return Date.now() - this.props.createdAt.getTime();
    }
    return this.props.completedAt.getTime() - this.props.createdAt.getTime();
  }

  toPlainObject(): Required<StorageOperationProps> {
    return { ...this.props };
  }
}