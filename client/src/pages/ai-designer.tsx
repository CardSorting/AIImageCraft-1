import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Wand2, Menu, ArrowLeft, MessageSquare, Plus } from "lucide-react";
import { ChatInterface } from "@/presentation/ai-designer/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AIDesigner() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
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
              onClick={() => window.location.reload()}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Creation
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 p-4">
            <div className="text-sm text-muted-foreground mb-4">No chats yet</div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/20">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start h-9 text-sm hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Settings
            </Button>
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
          <ChatInterface className="flex-1" />
        </div>
      </div>
    </div>
  );
}