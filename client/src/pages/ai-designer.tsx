import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Wand2, Menu, ArrowLeft, MessageSquare } from "lucide-react";
import { ChatInterface } from "@/components/ai-designer/ChatInterface";
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* ChatGPT-style mobile-first layout */}
      <div className="flex-1 flex flex-col max-w-none md:max-w-4xl md:mx-auto w-full h-screen md:h-auto">
        
        {/* ChatGPT-style Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20 px-3 py-2 md:px-6 md:py-4 safe-area-top">
          <div className="flex items-center justify-between">
            
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:hidden">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full md:rounded-2xl flex items-center justify-center shadow-sm">
                  <Wand2 className="h-3.5 w-3.5 md:h-5 md:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base md:text-xl font-semibold text-foreground truncate">AI Designer</h1>
                  <p className="text-xs md:text-sm text-muted-foreground truncate hidden md:block">Transform images with AI chat</p>
                </div>
              </div>
            </div>

            {/* Right side - Menu and actions */}
            <div className="flex items-center gap-1 md:gap-2">
              
              {/* Chat history - Desktop */}
              <Button variant="ghost" size="sm" className="hidden md:flex h-8 px-3 text-xs">
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                History
              </Button>
              
              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {showMobileMenu && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/20 shadow-lg">
              <div className="px-3 py-2 space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat History
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
                <div className="border-t border-border/20 my-1" />
                <Link href="/">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Chat Interface - Full height on mobile */}
        <ChatInterface className="flex-1 min-h-0" />
      </div>
    </div>
  );
}