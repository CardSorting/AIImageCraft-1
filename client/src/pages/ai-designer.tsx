import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Wand2, Menu, ArrowLeft, MessageSquare, Plus, Trash2 } from "lucide-react";
import { SimpleChatInterface } from "@/presentation/ai-designer/components/SimpleChatInterface";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface ChatSession {
  id: string;
  userId: number;
  title: string;
  previewImage?: string;
  messageCount: number;
  lastActivity: string;
  createdAt: string;
}

export default function AIDesigner() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Check authentication
  const { data: authStatus } = useQuery<{ isAuthenticated: boolean; user?: any }>({
    queryKey: ['/api/auth/profile'],
    refetchInterval: 30000,
  });

  // Fetch chat sessions from database
  const { data: chatSessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['/api/chat/sessions'],
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: { id: string; title: string; previewImage?: string }) => {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      if (!response.ok) throw new Error('Failed to create session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
    },
  });

  const createNewSession = () => {
    setCurrentSessionId(null);
    const newSessionId = crypto.randomUUID();
    setCurrentSessionId(newSessionId);
  };

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const deleteSession = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId);
    
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const onSessionCreated = (session: any) => {
    createSessionMutation.mutate({
      id: session.id,
      title: session.title,
      previewImage: session.previewImage,
    });
    setCurrentSessionId(session.id);
  };

  const formatSessionTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Note: Authentication redirect removed for testing database integration

  if (!authStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar - ChatGPT style */}
      <div className={`${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 w-80 h-full bg-muted/30 dark:bg-muted/20 border-r border-border/20 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <Wand2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">DreamBees Art</span>
            </div>
            
            <Button 
              className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              onClick={createNewSession}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Creation
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 p-4 overflow-y-auto">
            {chatSessions.length === 0 ? (
              <div className="text-sm text-muted-foreground mb-4">No chats yet</div>
            ) : (
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      currentSessionId === session.id ? 'bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800' : ''
                    }`}
                    onClick={() => selectSession(session.id)}
                  >
                    <div className="flex items-start gap-3">
                      {session.previewImage && (
                        <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                          <img src={session.previewImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {session.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.messageCount} messages • {formatSessionTime(session.lastActivity)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/20">
            <Link href="/gallery">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start h-9 text-sm hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Gallery
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile overlay */}
        {showMobileMenu && (
          <div 
            className="md:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowMobileMenu(false)}
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        
        {/* Mobile Header - only visible on mobile */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/20">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0"
            onClick={() => setShowMobileMenu(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-foreground">AI Designer</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Chat Interface Area */}
        <div className="flex-1 flex flex-col">
          <SimpleChatInterface 
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}