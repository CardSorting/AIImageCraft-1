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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Apple-inspired iOS-like layout with clean hierarchy */}
      <div className="flex-1 flex flex-col max-w-none md:max-w-5xl md:mx-auto w-full h-screen">
        
        {/* iOS-style Navigation Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-3xl border-b border-border/10 px-4 py-2 md:px-6 md:py-3 safe-area-top">
          <div className="flex items-center justify-between">
            
            {/* Left section - Navigation and branding */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 md:hidden rounded-full hover:bg-muted/50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-blue-600" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 md:w-11 md:h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Wand2 className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg md:text-2xl font-bold text-foreground tracking-tight">AI Designer</h1>
                  <p className="text-sm md:text-base text-muted-foreground hidden md:block font-medium">Transform images with natural language</p>
                </div>
              </div>
            </div>

            {/* Right section - Actions with iOS-style buttons */}
            <div className="flex items-center gap-2">
              
              {/* New Chat - iOS style */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex h-9 px-4 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium transition-colors"
                onClick={() => window.location.reload()}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
              
              {/* Chat History - Desktop */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex h-9 px-4 rounded-full hover:bg-muted/50 transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                History
              </Button>
              
              {/* Mobile menu with iOS-style design */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 md:hidden rounded-full hover:bg-muted/50 transition-colors"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* iOS-style dropdown menu with blur effect */}
          {showMobileMenu && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-3xl border-b border-border/10 shadow-xl shadow-black/5">
              <div className="px-4 py-3 space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start h-11 text-base rounded-xl hover:bg-muted/50 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  <Plus className="h-5 w-5 mr-3 text-blue-600" />
                  New Chat
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start h-11 text-base rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <MessageSquare className="h-5 w-5 mr-3" />
                  Chat History
                </Button>
                <div className="border-t border-border/20 my-2" />
                <Link href="/">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start h-11 text-base rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 mr-3" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Chat Interface with Apple-inspired design */}
        <ChatInterface className="flex-1 min-h-0" />
      </div>
    </div>
  );
}