import { useLocation } from "wouter";
import { Sparkles, Image, Plus, Brain, User, Coins, LogIn, Wand2, Palette } from "lucide-react";
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
    id: "models",
    label: "Models",
    icon: Sparkles,
    href: "/models",
  },
  {
    id: "ai-designer",
    label: "Designer",
    icon: Palette,
    href: "/ai-designer",
  },
  {
    id: "generate",
    label: "",
    icon: Plus,
    href: "/create",
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: Image,
    href: "/gallery",
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

  // Use centralized auth - no polling needed
  const { data: authStatus } = useQuery<{ isAuthenticated: boolean; user?: any }>({
    queryKey: ['/api/auth/profile'],
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: creditBalance } = useQuery<{ balance: number }>({
    queryKey: ['/api/credit-balance/1'],
    enabled: authStatus?.isAuthenticated || false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleNavigation = (href: string, requiresAuth: boolean = false) => {
    // Add haptic feedback simulation
    if (navigator.vibrate) navigator.vibrate(50);
    
    // Check authentication for protected routes
    if (requiresAuth && !authStatus?.isAuthenticated) {
      // Redirect to existing Auth0 login route
      window.location.href = '/api/login';
      return;
    }
    
    navigate(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        {/* Glass morphism background */}
        <div className="glass-effect border-t border-border/50 px-2 py-2">
        <div className="flex items-center justify-between w-full max-w-sm mx-auto px-2">
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
                  onClick={() => handleNavigation(item.href, false)}
                  className="relative -mt-6 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg flex items-center justify-center haptic-medium transform active:scale-90 transition-all duration-200 hover:shadow-xl"
                >
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                  <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                </button>
              );
            }

            const requiresAuth = item.id === "ai-maker" || item.id === "ai-designer";
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href, requiresAuth)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 haptic-light min-h-[60px] relative flex-1 max-w-[70px]",
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
                  <item.icon className="w-5 h-5 mb-1" />
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-[10px] sm:text-xs font-medium transition-all duration-200 text-center leading-tight",
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
  );
}