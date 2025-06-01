// Domain Service: Chat History Management
// Handles chat session persistence and management
// Follows Single Responsibility Principle

import { ChatMessage } from '../entities/ChatMessage';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: Date;
  messageCount: number;
  preview: string;
}

export interface IChatHistoryService {
  getCurrentSession(): string;
  createNewSession(): string;
  switchToSession(sessionId: string): void;
  saveMessage(message: ChatMessage): Promise<void>;
  getSessionMessages(sessionId?: string): Promise<ChatMessage[]>;
  getSessions(): Promise<ChatSession[]>;
  deleteSession(sessionId: string): Promise<void>;
  updateSessionTitle(sessionId: string, title: string): Promise<void>;
  generateSessionTitle(messages: ChatMessage[]): string;
}

export class LocalChatHistoryService implements IChatHistoryService {
  private currentSessionId: string;
  private readonly storagePrefix = 'ai-designer-chat';
  private readonly sessionsKey = 'ai-designer-sessions';

  constructor() {
    this.currentSessionId = this.loadCurrentSession() || this.createNewSession();
  }

  getCurrentSession(): string {
    return this.currentSessionId;
  }

  createNewSession(): string {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.currentSessionId = sessionId;
    this.saveCurrentSession(sessionId);
    return sessionId;
  }

  switchToSession(sessionId: string): void {
    this.currentSessionId = sessionId;
    this.saveCurrentSession(sessionId);
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    const sessionKey = `${this.storagePrefix}-${this.currentSessionId}`;
    const messages = await this.getSessionMessages(this.currentSessionId);
    const updatedMessages = [...messages, message];
    
    localStorage.setItem(sessionKey, JSON.stringify(updatedMessages));
    await this.updateSessionMetadata(this.currentSessionId, updatedMessages);
  }

  async getSessionMessages(sessionId?: string): Promise<ChatMessage[]> {
    const targetSessionId = sessionId || this.currentSessionId;
    const sessionKey = `${this.storagePrefix}-${targetSessionId}`;
    
    try {
      const stored = localStorage.getItem(sessionKey);
      if (!stored) return this.getDefaultMessages();
      
      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch {
      return this.getDefaultMessages();
    }
  }

  async getSessions(): Promise<ChatSession[]> {
    try {
      const stored = localStorage.getItem(this.sessionsKey);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((session: any) => ({
        ...session,
        lastMessage: new Date(session.lastMessage),
      })).sort((a: ChatSession, b: ChatSession) => 
        b.lastMessage.getTime() - a.lastMessage.getTime()
      );
    } catch {
      return [];
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionKey = `${this.storagePrefix}-${sessionId}`;
    localStorage.removeItem(sessionKey);
    
    const sessions = await this.getSessions();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(this.sessionsKey, JSON.stringify(updatedSessions));
    
    // If we deleted the current session, create a new one
    if (sessionId === this.currentSessionId) {
      this.createNewSession();
    }
  }

  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const sessions = await this.getSessions();
    const updatedSessions = sessions.map(session => 
      session.id === sessionId ? { ...session, title } : session
    );
    localStorage.setItem(this.sessionsKey, JSON.stringify(updatedSessions));
  }

  generateSessionTitle(messages: ChatMessage[]): string {
    // Find the first user message with content
    const firstUserMessage = messages.find(m => 
      m.role === 'user' && m.content && !m.content.includes("I've uploaded an image")
    );
    
    if (firstUserMessage) {
      // Extract the first few words and create a title
      const words = firstUserMessage.content.trim().split(' ').slice(0, 4);
      return words.join(' ') + (firstUserMessage.content.split(' ').length > 4 ? '...' : '');
    }
    
    // Fallback to default title with timestamp
    const now = new Date();
    return `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  private getDefaultMessages(): ChatMessage[] {
    return [
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI Designer assistant. Upload an image and tell me how you'd like to edit it. I can enhance details, change styles, modify backgrounds, add or remove objects, and adjust colors.",
        timestamp: new Date(),
      }
    ];
  }

  private loadCurrentSession(): string | null {
    return localStorage.getItem('ai-designer-current-session');
  }

  private saveCurrentSession(sessionId: string): void {
    localStorage.setItem('ai-designer-current-session', sessionId);
  }

  private async updateSessionMetadata(sessionId: string, messages: ChatMessage[]): Promise<void> {
    const sessions = await this.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === sessionId);
    
    const lastMessage = messages[messages.length - 1];
    const preview = lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
    
    const sessionData: ChatSession = {
      id: sessionId,
      title: this.generateSessionTitle(messages),
      lastMessage: lastMessage.timestamp,
      messageCount: messages.length,
      preview,
    };
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionData;
    } else {
      sessions.push(sessionData);
    }
    
    localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
  }
}