import { Heart, Users, Gavel, User, Coins, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

interface DesktopNavigationProps {
  credits: number;
  onNavigationClick: (itemId: string) => void;
  activeItem?: string;
}

const navigationItems: NavigationItem[] = [
  { id: "for-you", label: "For You", icon: Heart },
  { id: "following", label: "Following", icon: Users },
  { id: "auction", label: "Auction", icon: Gavel },
];

export function DesktopNavigation({ 
  credits, 
  onNavigationClick, 
  activeItem = "for-you" 
}: DesktopNavigationProps) {
  const [location, setLocation] = useLocation();

  const handleCreateClick = () => {
    setLocation("/create");
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/30 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105">
                <Sparkles className="text-primary-foreground w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground tracking-tight">AI Studio</h1>
              </div>
            </div>
          </div>

          {/* Navigation Items - Desktop */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center bg-background/60 backdrop-blur-xl border border-border/40 rounded-2xl p-1 shadow-lg">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigationClick(item.id)}
                    className={`
                      relative flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                        : 'text-foreground hover:text-primary hover:bg-background/80'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : ''}`} />
                    <span>{item.label}</span>
                    
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Create Button, Credits and Sign In */}
          <div className="flex items-center space-x-4">
            {/* Create Button */}
            <Button 
              onClick={handleCreateClick}
              className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground px-6 py-3 h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-2xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>

            {/* Enhanced Credits Display */}
            <div className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-xl border border-border/50 rounded-2xl px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Coins className="h-3 w-3 text-yellow-900" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">{credits.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground leading-none">credits</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Sign In Button */}
            <Button className="btn-ios-primary px-6 py-3 h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}