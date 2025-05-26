import { ReactNode } from "react";
import { BottomNavigation } from "../navigation/BottomNavigation";
import { AuthStatus } from "../AuthStatus";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      {/* Top Header Navigation */}
      {showNavigation && (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Sparkles className="h-6 w-6" />
                <span className="hidden font-bold sm:inline-block">
                  AI Studio
                </span>
              </Link>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Home
                </Link>
                <Link href="/generate" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Create
                </Link>
                <Link href="/gallery" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Gallery
                </Link>
                <Link href="/models" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Models
                </Link>
              </nav>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
                  <Sparkles className="h-6 w-6" />
                  <span className="font-bold">AI Studio</span>
                </Link>
              </div>
              <nav className="flex items-center">
                <AuthStatus />
              </nav>
            </div>
          </div>
        </header>
      )}

      {/* Main content area with proper padding */}
      <main className={cn(
        "transition-all duration-300 ease-out",
        showNavigation ? "pb-20 safe-area-bottom" : "pb-0",
        className
      )}>
        {children}
      </main>

      {/* Bottom Navigation - Always visible */}
      {showNavigation && <BottomNavigation />}
    </div>
  );
}