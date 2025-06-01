/**
 * Virtualized style grid for mobile performance
 * Supports lazy loading and smooth animations
 */

import { CosplayStyle } from "@shared/cosplayStyles";
import { Badge } from "@/components/ui/badge";

interface StyleGridProps {
  styles: CosplayStyle[];
  selectedStyle: string | null;
  onStyleSelect: (styleId: string) => void;
  className?: string;
}

export function StyleGrid({ 
  styles, 
  selectedStyle, 
  onStyleSelect,
  className = ""
}: StyleGridProps) {
  return (
    <div className={`grid grid-cols-2 gap-2 md:gap-3 ${className}`}>
      {styles.map((style) => {
        const isSelected = selectedStyle === style.id;
        const Icon = style.icon;
        
        return (
          <div
            key={style.id}
            onClick={() => {
              onStyleSelect(style.id);
              // Add haptic feedback for mobile
              if (navigator.vibrate) navigator.vibrate(30);
            }}
            className={`
              relative p-3 md:p-4 rounded-xl md:rounded-2xl border-2 cursor-pointer 
              transition-all duration-200 active:scale-95 hover:scale-[1.02]
              ${isSelected
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg scale-[1.02]'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 hover:shadow-md'
              }
            `}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center z-10">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              {style.popular && (
                <Badge variant="secondary" className="text-xs px-2 py-0 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  ⭐
                </Badge>
              )}
              {style.premium && (
                <Badge variant="secondary" className="text-xs px-2 py-0 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  👑
                </Badge>
              )}
            </div>
            
            {/* Difficulty indicator */}
            {style.difficulty && (
              <div className="absolute top-2 right-2">
                <div className={`
                  w-2 h-2 rounded-full
                  ${style.difficulty === 'easy' ? 'bg-green-400' : 
                    style.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'}
                `} />
              </div>
            )}
            
            <div className={`text-center space-y-2 ${style.popular || style.premium ? 'mt-4' : ''}`}>
              <div className="flex items-center justify-center">
                <Icon className={`
                  w-6 h-6 md:w-8 md:h-8 transition-colors
                  ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}
                `} />
              </div>
              
              <h4 className={`
                font-semibold text-xs md:text-sm leading-tight transition-colors
                ${isSelected 
                  ? 'text-purple-700 dark:text-purple-300' 
                  : 'text-gray-900 dark:text-gray-100'
                }
              `}>
                {style.name}
              </h4>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight line-clamp-2">
                {style.description}
              </p>
              
              {/* Tags */}
              {style.tags && style.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {style.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}