// Application Layer - Query following CQRS pattern
import { Message } from '../../../domain/ai-designer/entities/Message';
import { ImageEditSession } from '../../../domain/ai-designer/entities/ImageEditSession';

export interface GetChatHistoryQuery {
  sessionId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface ChatHistoryQueryResult {
  messages: ReadonlyArray<Message>;
  session?: ImageEditSession;
  totalCount: number;
  hasMore: boolean;
}

// Query Handler - Single Responsibility Principle
export interface IGetChatHistoryQueryHandler {
  handle(query: GetChatHistoryQuery): Promise<ChatHistoryQueryResult>;
}

export class GetChatHistoryQueryHandler implements IGetChatHistoryQueryHandler {
  constructor(
    private readonly sessionRepository: import('../commands/EditImageCommand').ISessionRepository,
    private readonly messageRepository: IMessageRepository
  ) {}

  async handle(query: GetChatHistoryQuery): Promise<ChatHistoryQueryResult> {
    try {
      const limit = query.limit || 50;
      const offset = query.offset || 0;

      if (query.sessionId) {
        // Get specific session with messages
        const session = await this.sessionRepository.findById(query.sessionId);
        if (!session) {
          return {
            messages: [],
            totalCount: 0,
            hasMore: false
          };
        }

        const messages = session.getMessages();
        const paginatedMessages = messages.slice(offset, offset + limit);
        
        return {
          messages: paginatedMessages,
          session,
          totalCount: messages.length,
          hasMore: offset + limit < messages.length
        };
      } else if (query.userId) {
        // Get all sessions for user with recent messages
        const sessions = await this.sessionRepository.findByUserId(query.userId);
        const allMessages = sessions
          .flatMap(session => session.getMessages())
          .sort((a, b) => b.timestamp.value.getTime() - a.timestamp.value.getTime());

        const paginatedMessages = allMessages.slice(offset, offset + limit);

        return {
          messages: paginatedMessages,
          totalCount: allMessages.length,
          hasMore: offset + limit < allMessages.length
        };
      } else {
        // Get recent messages across all sessions
        const messages = await this.messageRepository.getRecent(limit, offset);
        const totalCount = await this.messageRepository.getTotalCount();

        return {
          messages,
          totalCount,
          hasMore: offset + limit < totalCount
        };
      }
    } catch (error) {
      return {
        messages: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }
}

export interface IMessageRepository {
  getRecent(limit: number, offset: number): Promise<Message[]>;
  getTotalCount(): Promise<number>;
  findBySessionId(sessionId: string): Promise<Message[]>;
}