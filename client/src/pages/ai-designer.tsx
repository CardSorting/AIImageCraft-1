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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">AI Designer</h1>
              <p className="text-sm text-muted-foreground">Chat-based image editing with FLUX Kontext</p>
            </div>
          </div>
        </div>

        {/* Chat Interface Component */}
        <ChatInterface className="flex-1" />
      </div>
    </div>
  );
}