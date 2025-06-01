// Repository Interface: Chat Repository
// Follows Interface Segregation Principle and Dependency Inversion

import { ChatMessage } from '../entities/ChatMessage';

export interface IChatRepository {
  saveMessage(message: ChatMessage): Promise<void>;
  getMessageHistory(sessionId: string): Promise<ChatMessage[]>;
  updateMessage(messageId: string, updates: Partial<ChatMessage>): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  clearHistory(sessionId: string): Promise<void>;
}

// Local storage implementation for MVP
export class LocalChatRepository implements IChatRepository {
  private readonly storageKey = 'ai-designer-chat-history';

  async saveMessage(message: ChatMessage): Promise<void> {
    const history = await this.getMessageHistory('default');
    const updatedHistory = [...history, message];
    localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
  }

  async getMessageHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch {
      return [];
    }
  }

  async updateMessage(messageId: string, updates: Partial<ChatMessage>): Promise<void> {
    const history = await this.getMessageHistory('default');
    const updatedHistory = history.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    );
    localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
  }

  async deleteMessage(messageId: string): Promise<void> {
    const history = await this.getMessageHistory('default');
    const updatedHistory = history.filter(msg => msg.id !== messageId);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
  }

  async clearHistory(sessionId: string): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }
}