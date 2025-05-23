import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";

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
  
  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <DesktopNavigation 
          credits={credits}
          onNavigationClick={onNavigationClick}
          activeItem={activeItem}
        />
      </div>
      
      {/* Mobile Navigation */}
      <div className="block md:hidden">
        <MobileNavigation 
          credits={credits}
          onNavigationClick={onNavigationClick}
          activeItem={activeItem}
        />
      </div>
    </>
  );
}