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
  
  // Check authentication status and get credit balance in one call
  const { data: authStatus } = useQuery<{ isAuthenticated: boolean; user?: any; userId?: number; creditBalance?: number }>({
    queryKey: ['/api/auth/profile'],
    refetchInterval: 30000, // Check auth every 30 seconds
    staleTime: 15000, // Consider data fresh for 15 seconds
  });
  
  const isAuthenticated = authStatus?.isAuthenticated || false;
  
  // Use credit balance from auth profile response
  const displayCredits = isAuthenticated ? (authStatus?.creditBalance ?? 0) : 0;
  
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