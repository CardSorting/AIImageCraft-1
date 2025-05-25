import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { useLocation } from "wouter";

interface NavigationHeaderProps {
  credits?: number;
  onNavigationClick?: (itemId: string) => void;
  activeItem?: string;
}

export function NavigationHeader({ 
  credits = 1250, 
  onNavigationClick = () => {}, 
  activeItem 
}: NavigationHeaderProps) {
  const isMobile = useIsMobile();
  const [location, setLocation] = useLocation();
  
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
          credits={credits}
          onNavigationClick={handleNavClick}
          activeItem={getCurrentActiveItem()}
        />
      </div>
    </>
  );
}