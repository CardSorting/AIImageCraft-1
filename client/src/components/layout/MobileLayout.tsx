import { ReactNode } from "react";
import { BottomNavigation } from "../navigation/BottomNavigation";
import { NavigationHeader } from "../navigation/NavigationHeader";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  className?: string;
}

export function MobileLayout({ 
  children, 
  showNavigation = true,
  className 
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Use the same NavigationHeader as the models page */}
      {showNavigation && <NavigationHeader />}

      {/* Main content area with proper padding */}
      <main className={cn(
        "transition-all duration-300 ease-out",
        showNavigation ? "pb-20 safe-area-bottom" : "pb-0",
        className
      )}>
        {children}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      {showNavigation && (
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      )}
    </div>
  );
}