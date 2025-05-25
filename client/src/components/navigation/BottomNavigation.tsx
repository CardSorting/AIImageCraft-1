import { useLocation } from "wouter";
import { Home, Image, Plus, Brain, User, Coins, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: Image,
    href: "/gallery",
  },
  {
    id: "generate",
    label: "",
    icon: Plus,
    href: "/create",
  },
  {
    id: "models",
    label: "Models",
    icon: Brain,
    href: "/models",
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    href: "/profile",
  },
];

export function BottomNavigation() {
  const [location, navigate] = useLocation();

  // Fetch user authentication status and credit balance
  const { data: authStatus } = useQuery<{ isAuthenticated: boolean; user?: any }>({
    queryKey: ['/api/auth/profile'],
    refetchInterval: 30000,
  });

  const { data: creditBalance } = useQuery<{ balance: number }>({
    queryKey: ['/api/credit-balance/1'],
    enabled: true,
    refetchInterval: 30000,
  });

  const handleNavigation = (href: string) => {
    // Add haptic feedback simulation
    if (navigator.vibrate) navigator.vibrate(50);
    navigate(href);
  };

  return (
    <>
      {/* Mobile Credits and Auth Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          {/* Credits Display */}
          <div 
            onClick={() => navigate('/dreamcredits')}
            className="flex items-center space-x-2 bg-gradient-to-r from-background/90 to-background/70 backdrop-blur-xl border border-border/60 rounded-xl px-3 py-2 shadow-sm cursor-pointer"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Coins className="h-3 w-3 text-amber-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground leading-none">
                {creditBalance?.balance?.toLocaleString() || '0'}
              </span>
              <span className="text-xs text-muted-foreground leading-none">credits</span>
            </div>
          </div>

          {/* User Auth Status */}
          <div className="flex items-center space-x-2">
            {authStatus?.isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-background/90 backdrop-blur-xl border border-border/60 rounded-xl px-3 py-2 shadow-sm">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {authStatus.user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <button 
                  onClick={() => window.location.href = '/logout'}
                  className="w-8 h-8 rounded-lg bg-background/90 border border-border/60 flex items-center justify-center"
                >
                  <LogIn className="h-4 w-4 transform rotate-180" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => window.location.href = '/login'}
                className="flex items-center space-x-2 bg-primary text-primary-foreground rounded-xl px-3 py-2 shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        {/* Glass morphism background */}
        <div className="glass-effect border-t border-border/50 px-2 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = 
              item.href === "/" 
                ? location === "/" 
                : location.startsWith(item.href);
            
            const isFloatingAction = item.id === "generate";

            if (isFloatingAction) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className="relative -mt-6 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg flex items-center justify-center haptic-medium transform active:scale-90 transition-all duration-200 hover:shadow-xl"
                >
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                  <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 haptic-light min-h-[60px] relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-scale-in" />
                )}
                
                {/* Icon with scale animation */}
                <div className={cn(
                  "transition-transform duration-200",
                  isActive ? "scale-110" : "scale-100"
                )}>
                  <item.icon className="w-6 h-6 mb-1" />
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium transition-all duration-200",
                  isActive ? "opacity-100 font-semibold" : "opacity-70"
                )}>
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center animate-scale-in">
                    <span className="text-xs font-bold text-destructive-foreground">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  </div>
                )}

                {/* Ripple effect on tap */}
                <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 active:opacity-100 transition-opacity duration-75" />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
    </>
  );
}