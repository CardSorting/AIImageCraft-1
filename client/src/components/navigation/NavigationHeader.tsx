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
  const currentUserId = authStatus?.userId || 1; // Default to user ID 1 for demo/testing
  
  // Fetch credit balance for current user (always enabled since we have a default user)
  const { data: creditBalance } = useQuery<{ balance: number }>({
    queryKey: [`/api/credits/balance/${currentUserId}`], // Using dynamic user ID
    refetchInterval: 5000, // Refresh more frequently to show real-time updates
    staleTime: 0, // Always fetch fresh data
  });
  
  // Use fetched balance or fallback to props
  const displayCredits = creditBalance?.balance ?? credits ?? 0;
  
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