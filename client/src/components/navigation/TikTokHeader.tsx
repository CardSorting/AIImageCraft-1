import { useState } from "react";
import { Search, MessageCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TikTokHeaderProps {
  activeTab: "for-you" | "following";
  onTabChange: (tab: "for-you" | "following") => void;
  showSearch?: boolean;
}

export function TikTokHeader({ 
  activeTab, 
  onTabChange, 
  showSearch = false 
}: TikTokHeaderProps) {
  const [isSearchVisible, setIsSearchVisible] = useState(showSearch);

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 safe-area-top">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left Side - Live/Search */}
        <div className="flex items-center space-x-3 w-1/4">
          {!isSearchVisible ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchVisible(true)}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl"
            >
              <Search className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex-1">
              <Input
                placeholder="Search"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-9 text-sm"
                onBlur={() => setIsSearchVisible(false)}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Center - Navigation Tabs */}
        <div className="flex items-center justify-center flex-1">
          <div className="flex items-center bg-white/5 rounded-full p-1">
            <button
              onClick={() => onTabChange("for-you")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                activeTab === "for-you"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/70 hover:text-white"
              )}
            >
              For You
            </button>
            <button
              onClick={() => onTabChange("following")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                activeTab === "following"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/70 hover:text-white"
              )}
            >
              Following
            </button>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-3 w-1/4 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl relative"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}