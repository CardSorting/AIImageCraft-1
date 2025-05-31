import { Heart, Users, Gavel, User, Coins, Sparkles, Plus, Search, Bell, Settings, ChevronDown, LogOut, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

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
  { id: "create", label: "Create", icon: Plus },
  { id: "ai-cosplay", label: "AI Maker", icon: Wand2 },
  { id: "gallery", label: "Gallery", icon: Users },
  { id: "models", label: "Models", icon: Sparkles },
];

export function DesktopNavigation({ 
  credits, 
  onNavigationClick, 
  activeItem = "for-you" 
}: DesktopNavigationProps) {
  const [location, setLocation] = useLocation();

  // Fetch user authentication status
  const { data: authStatus } = useQuery<{ isAuthenticated: boolean; user?: any }>({
    queryKey: ['/api/auth/profile'],
    refetchInterval: 30000, // Check auth status every 30 seconds
  });

  const handleCreateClick = () => {
    setLocation("/create");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo and Brand - Enhanced */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setLocation("/")}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <Sparkles className="text-primary-foreground w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Dream Bees Art</h1>
                <p className="text-xs text-muted-foreground leading-none">Create amazing artwork</p>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search models, prompts, or artists..." 
                className="pl-10 h-10 bg-background/60 border-border/60 focus:border-primary/50 rounded-xl transition-all duration-200"
              />
            </div>
          </div>

          {/* Navigation Items - Enhanced */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl p-1.5 shadow-lg">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === 'home' ? location === '/' : location.startsWith(`/${item.id}`);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      // Check authentication for AI Maker route
                      if (item.id === 'ai-cosplay' && !authStatus?.isAuthenticated) {
                        window.location.href = '/login';
                        return;
                      }
                      
                      onNavigationClick(item.id);
                      setLocation(item.id === 'home' ? '/' : `/${item.id}`);
                    }}
                    className={`
                      relative flex items-center space-x-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'text-foreground hover:text-primary hover:bg-background/90'
                      }
                    `}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'text-primary-foreground' : 'group-hover:scale-110'}`} />
                    <span className="font-medium">{item.label}</span>
                    
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Side Actions - Enhanced */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-xl hover:bg-background/80 transition-colors duration-200">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">3</Badge>
            </Button>

            {/* Credits Display - Enhanced */}
            <div 
              onClick={() => onNavigationClick('credits')}
              className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-background/90 to-background/70 backdrop-blur-xl border border-border/60 rounded-xl px-4 py-2.5 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Coins className="h-3.5 w-3.5 text-amber-900" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground leading-none">{credits.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground leading-none">credits</span>
                </div>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              {authStatus?.isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* User Profile */}
                  <div className="flex items-center space-x-3 bg-background/90 backdrop-blur-xl border border-border/60 rounded-xl px-4 py-2.5 shadow-md">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground leading-none">
                        {authStatus.user?.email?.split('@')[0] || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground leading-none">Signed in</span>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <Button 
                    onClick={() => window.location.href = '/logout'}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-xl hover:bg-background/80 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}