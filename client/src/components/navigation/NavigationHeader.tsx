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
  activeItem = "for-you" 
}: NavigationHeaderProps) {
  const isMobile = useIsMobile();
  const [location, setLocation] = useLocation();
  
  const handleNavClick = (itemId: string) => {
    onNavigationClick(itemId);
    
    // Handle routing
    switch (itemId) {
      case "for-you":
        setLocation("/");
        break;
      case "following":
        setLocation("/following");
        break;
      default:
        break;
    }
  };
  
  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <DesktopNavigation 
          credits={credits}
          onNavigationClick={handleNavClick}
          activeItem={activeItem}
        />
      </div>
      
      {/* Mobile Navigation */}
      <div className="block md:hidden">
        <MobileNavigation 
          credits={credits}
          onNavigationClick={handleNavClick}
          activeItem={activeItem}
        />
      </div>
    </>
  );
}