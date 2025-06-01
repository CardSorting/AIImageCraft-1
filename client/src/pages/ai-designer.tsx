import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Wand2 } from "lucide-react";
import { ChatInterface } from "@/components/ai-designer/ChatInterface";

export default function AIDesigner() {
  // Check authentication
  const { data: authStatus } = useQuery<{ isAuthenticated: boolean; user?: any }>({
    queryKey: ['/api/auth/profile'],
    refetchInterval: 30000,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (authStatus && !authStatus.isAuthenticated) {
      window.location.href = '/login';
    }
  }, [authStatus]);

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile-first chat container */}
      <div className="flex-1 flex flex-col max-w-none md:max-w-4xl md:mx-auto w-full">
        {/* Header - Mobile optimized */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30 px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Wand2 className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">AI Designer</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">Chat-based image editing</p>
            </div>
            {/* Chat history button - mobile */}
            <button className="md:hidden p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Interface Component with mobile-first design */}
        <ChatInterface className="flex-1 pb-20 md:pb-0" />
      </div>
    </div>
  );
}