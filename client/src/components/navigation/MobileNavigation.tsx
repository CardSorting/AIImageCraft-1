import { useState } from "react";
import { Heart, Users, Gavel, User, Coins, Sparkles, Menu, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

interface MobileNavigationProps {
  credits: number;
  onNavigationClick: (itemId: string) => void;
  activeItem?: string;
}

const navigationItems: NavigationItem[] = [
  { id: "for-you", label: "For You", icon: Heart },
  { id: "following", label: "Following", icon: Users },
];

export function MobileNavigation({ 
  credits, 
  onNavigationClick, 
  activeItem = "for-you" 
}: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const handleNavigationClick = (itemId: string) => {
    onNavigationClick(itemId);
    setIsMenuOpen(false);
  };

  const handleCreateClick = () => {
    setLocation("/create");
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/30 safe-area-top md:hidden">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-md">
              <Sparkles className="text-primary-foreground w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">AI Studio</h1>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-3">
            {/* Compact Credits Display */}
            <div className="flex items-center space-x-2 bg-background/60 backdrop-blur-sm border border-border/50 rounded-full px-3 py-2">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Coins className="h-2 w-2 text-yellow-900" />
              </div>
              <span className="text-xs font-bold text-foreground">{credits > 999 ? `${(credits/1000).toFixed(1)}K` : credits}</span>
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-10 h-10 rounded-2xl border border-border/50 hover:bg-background/80 transition-all duration-200"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              
              <SheetContent 
                side="right" 
                className="w-80 bg-background/95 backdrop-blur-xl border-l border-border/50 p-0"
              >
                {/* Mobile Menu Header */}
                <div className="p-6 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                        <Sparkles className="text-primary-foreground w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-foreground">AI Studio</h2>
                        <p className="text-sm text-muted-foreground">Create & Explore</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Credits Section */}
                <div className="p-6 border-b border-border/30">
                  <div className="bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Coins className="h-4 w-4 text-yellow-900" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{credits.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Available Credits</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="p-6 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigationClick(item.id)}
                        className={`
                          w-full flex items-center space-x-4 p-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-[1.02]
                          ${isActive 
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                            : 'text-foreground hover:bg-background/80 active:bg-background/90'
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                        <span className="text-base">{item.label}</span>
                        
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sign In Section */}
                <div className="p-6 mt-auto border-t border-border/30">
                  <Button 
                    className="w-full btn-ios-primary h-12 text-base font-semibold shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Sign In to Continue
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}