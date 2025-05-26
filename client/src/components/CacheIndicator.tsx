/**
 * Cache Indicator Component
 * Shows cache status and statistics to users
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Database, Trash2, RefreshCw, Clock, HardDrive } from "lucide-react";
import { useImageCache } from "@/hooks/useImageCache";

interface CacheIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function CacheIndicator({ showDetails = false, className }: CacheIndicatorProps) {
  const { cacheStats, clearCache, refreshCachedImages } = useImageCache();

  const formatCacheAge = (ageMs: number) => {
    const minutes = Math.floor(ageMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const cacheHealth = Math.min((cacheStats.recentImages / Math.max(cacheStats.totalImages, 1)) * 100, 100);

  if (!showDetails) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className={`h-8 px-2 ${className}`}>
            <Database className="h-3 w-3 mr-1" />
            <span className="text-xs">{cacheStats.totalImages}</span>
            {cacheStats.recentImages > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {cacheStats.recentImages}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <CacheDetailsCard />
        </PopoverContent>
      </Popover>
    );
  }

  return <CacheDetailsCard />;
}

function CacheDetailsCard() {
  const { cacheStats, clearCache, refreshCachedImages } = useImageCache();

  const formatCacheAge = (ageMs: number) => {
    const minutes = Math.floor(ageMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const cacheHealth = Math.min((cacheStats.recentImages / Math.max(cacheStats.totalImages, 1)) * 100, 100);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Smart Cache Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cache Statistics */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <HardDrive className="h-3 w-3" />
              Total Images
            </div>
            <div className="font-medium">{cacheStats.totalImages}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              Recent (24h)
            </div>
            <div className="font-medium">{cacheStats.recentImages}</div>
          </div>
        </div>

        {/* Cache Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Cache Health</span>
            <span className="font-medium">{Math.round(cacheHealth)}%</span>
          </div>
          <Progress value={cacheHealth} className="h-1" />
        </div>

        {/* Cache Age */}
        {cacheStats.lastCleanup > 0 && (
          <div className="text-xs text-muted-foreground">
            Last cleanup: {formatCacheAge(Date.now() - cacheStats.lastCleanup)} ago
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshCachedImages}
            className="flex-1 h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCache}
            className="flex-1 h-7 text-xs"
            disabled={cacheStats.totalImages === 0}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        {/* Cache Benefits */}
        {cacheStats.totalImages > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
            💡 Smart cache reduces loading times and API calls by storing your recent images locally.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CacheIndicator;