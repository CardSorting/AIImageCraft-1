import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface NavigationHeaderProps {
  credits?: number;
  onNavigationClick?: (itemId: string) => void;
  activeItem?: string;
}

export function NavigationHeader({ 
  credits, 
  onNavigationClick = () => {}, 
  activeItem 
}: NavigationHeaderProps) {
  const isMobile = useIsMobile();
  const [location, setLocation] = useLocation();
  
  // Check authentication status first
  const { data: authStatus } = useQuery<{ isAuthenticated: boolean; user?: any; userId?: number }>({
    queryKey: ['/api/auth/profile'],
    refetchInterval: 60000, // Check auth every minute
  });
  
  const isAuthenticated = authStatus?.isAuthenticated || false;
  const currentUserId = authStatus?.userId;
  
  // Only fetch credit balance for authenticated users with a valid user ID
  const { data: creditBalance } = useQuery<{ balance: number }>({
    queryKey: [`/api/credits/balance/${currentUserId}`],
    enabled: isAuthenticated && !!currentUserId, // Only fetch if authenticated and have user ID
    refetchInterval: 5000, // Refresh more frequently to show real-time updates
    staleTime: 0, // Always fetch fresh data
  });
  
  // Use fetched balance for authenticated users, 0 for unauthenticated users
  const displayCredits = isAuthenticated && currentUserId ? (creditBalance?.balance ?? 0) : 0;
  
  // Determine active item based on current route if not provided
  const getCurrentActiveItem = () => {
    if (activeItem) return activeItem;
    
    if (location === '/') return 'home';
    if (location === '/create') return 'create';
    if (location === '/gallery') return 'gallery';
    if (location === '/models') return 'models';
    return 'home';
  };
  
  const handleNavClick = (itemId: string) => {
    onNavigationClick(itemId);
    
    // Handle routing
    switch (itemId) {
      case "home":
        setLocation("/");
        break;
      case "create":
        setLocation("/create");
        break;
      case "gallery":
        setLocation("/gallery");
        break;
      case "models":
        setLocation("/models");
        break;
      case "credits":
        setLocation("/credits");
        break;
      default:
        break;
    }
  };
  
  return (
    <>
      {/* Desktop Navigation Only */}
      <div className="hidden md:block">
        <DesktopNavigation 
          credits={displayCredits}
          onNavigationClick={handleNavClick}
          activeItem={getCurrentActiveItem()}
        />
      </div>
    </>
  );
}