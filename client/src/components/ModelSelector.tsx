import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Palette, Camera, Sparkles, Zap, Star } from "lucide-react";

interface Model {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  popular?: boolean;
}

const POPULAR_MODELS: Model[] = [
  {
    id: "runware:100@1",
    name: "Runware Base",
    description: "High-quality general purpose model",
    category: "General",
    icon: Brain,
    popular: true
  },
  {
    id: "flux/schnell",
    name: "Flux Schnell",
    description: "Ultra-fast generation with great quality",
    category: "Speed",
    icon: Zap,
    popular: true
  },
  {
    id: "flux/dev",
    name: "Flux Dev",
    description: "Latest development model with enhanced features",
    category: "Latest",
    icon: Sparkles,
    popular: true
  },
  {
    id: "sdxl/base",
    name: "SDXL Base",
    description: "Stable Diffusion XL for photorealistic images",
    category: "Photorealistic",
    icon: Camera
  },
  {
    id: "artistic/anime",
    name: "Anime Master",
    description: "Specialized for anime and manga style",
    category: "Artistic",
    icon: Palette
  }
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  const displayModels = showAll ? POPULAR_MODELS : POPULAR_MODELS.filter(m => m.popular);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">AI Model</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-xs"
        >
          {showAll ? "Show Popular" : "Show All"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayModels.map((model) => {
          const Icon = model.icon;
          const isSelected = value === model.id;

          return (
            <Card
              key={model.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
              onClick={() => onChange(model.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium truncate">{model.name}</h4>
                      {model.popular && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {model.description}
                    </p>
                    <Badge variant="outline" className="text-xs mt-2">
                      {model.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Fallback Select for any custom model */}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="input-ios">
          <SelectValue placeholder="Or select a custom model..." />
        </SelectTrigger>
        <SelectContent>
          {POPULAR_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}