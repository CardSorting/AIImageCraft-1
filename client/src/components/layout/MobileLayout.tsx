import { ReactNode } from "react";
import { BottomNavigation } from "../navigation/BottomNavigation";
import { AuthStatus } from "../AuthStatus";
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
      {/* Top Header with Auth Status */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container flex h-14 items-center justify-between px-4">
          <h1 className="font-semibold text-lg">AI Image Studio</h1>
          <AuthStatus />
        </div>
      </header>

      {/* Main content area with bottom padding for navigation */}
      <main className={cn(
        "transition-all duration-300 ease-out",
        showNavigation ? "pb-20 safe-area-bottom" : "pb-0",
        className
      )}>
        {children}
      </main>

      {/* Native iOS Bottom Navigation */}
      {showNavigation && <BottomNavigation />}
    </div>
  );
}