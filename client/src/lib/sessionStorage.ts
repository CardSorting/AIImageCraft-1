// Session storage for AI Designer chat sessions
export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
  previewImage?: string;
}

export class SessionStorageService {
  private static readonly SESSIONS_KEY = 'ai-designer-sessions';
  
  static getSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        lastActivity: new Date(session.lastActivity)
      }));
    } catch {
      return [];
    }
  }
  
  static saveSession(session: ChatSession): void {
    try {
      const sessions = this.getSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session); // Add new sessions at the beginning
      }
      
      // Keep only the last 50 sessions
      const trimmedSessions = sessions.slice(0, 50);
      
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(trimmedSessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }
  
  static deleteSession(sessionId: string): void {
    try {
      const sessions = this.getSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }
  
  static updateSessionActivity(sessionId: string): void {
    try {
      const sessions = this.getSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex >= 0) {
        sessions[sessionIndex].lastActivity = new Date();
        localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }
  
  static createNewSession(firstPrompt: string, imageUrl?: string): ChatSession {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: this.generateSessionTitle(firstPrompt),
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 1,
      previewImage: imageUrl
    };
    
    this.saveSession(session);
    return session;
  }
  
  private static generateSessionTitle(prompt: string): string {
    // Generate a meaningful title from the first prompt
    const words = prompt.trim().split(' ').slice(0, 4);
    let title = words.join(' ');
    
    if (title.length > 30) {
      title = title.substring(0, 27) + '...';
    }
    
    return title || 'New Chat';
  }
}