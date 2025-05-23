import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Wand2, Palette, Camera, Heart, Sparkles } from "lucide-react";

interface LoRA {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  defaultWeight: number;
}

const POPULAR_LORAS: LoRA[] = [
  {
    id: "realistic/photoreal",
    name: "PhotoRealistic",
    description: "Enhances photorealism and detail",
    category: "Style",
    icon: Camera,
    defaultWeight: 0.8
  },
  {
    id: "artistic/oil-painting",
    name: "Oil Painting",
    description: "Beautiful oil painting artistic style",
    category: "Artistic",
    icon: Palette,
    defaultWeight: 1.0
  },
  {
    id: "enhance/detail",
    name: "Detail Enhancer",
    description: "Adds fine details and textures",
    category: "Enhancement",
    icon: Sparkles,
    defaultWeight: 0.6
  },
  {
    id: "style/anime",
    name: "Anime Style",
    description: "High-quality anime and manga style",
    category: "Style",
    icon: Heart,
    defaultWeight: 1.2
  },
  {
    id: "lighting/dramatic",
    name: "Dramatic Lighting",
    description: "Enhances lighting and atmosphere",
    category: "Lighting",
    icon: Wand2,
    defaultWeight: 0.7
  }
];

interface SelectedLoRA {
  model: string;
  weight: number;
}

interface LoRASelectorProps {
  value: SelectedLoRA[];
  onChange: (loras: SelectedLoRA[]) => void;
}

export function LoRASelector({ value, onChange }: LoRASelectorProps) {
  const [showBrowser, setShowBrowser] = useState(false);

  const addLoRA = (loraId: string) => {
    const lora = POPULAR_LORAS.find(l => l.id === loraId);
    if (lora && !value.find(v => v.model === loraId)) {
      onChange([...value, { model: loraId, weight: lora.defaultWeight }]);
    }
  };

  const removeLoRA = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateWeight = (index: number, weight: number) => {
    const updated = [...value];
    updated[index] = { ...updated[index], weight };
    onChange(updated);
  };

  const getLoRAName = (model: string) => {
    return POPULAR_LORAS.find(l => l.id === model)?.name || model;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">LoRAs (Style Enhancers)</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowBrowser(!showBrowser)}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add LoRA
        </Button>
      </div>

      {/* Selected LoRAs */}
      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((lora, index) => (
            <Card key={index} className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {getLoRAName(lora.model)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Weight: {lora.weight.toFixed(1)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLoRA(index)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Influence Strength</Label>
                  <Slider
                    value={[lora.weight]}
                    onValueChange={([weight]) => updateWeight(index, weight)}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtle (0.0)</span>
                    <span>Strong (2.0)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* LoRA Browser */}
      {showBrowser && (
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Browse LoRAs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {POPULAR_LORAS.filter(lora => !value.find(v => v.model === lora.id)).map((lora) => {
                const Icon = lora.icon;
                
                return (
                  <div
                    key={lora.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => addLoRA(lora.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{lora.name}</h4>
                        <p className="text-xs text-muted-foreground">{lora.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {lora.category}
                      </Badge>
                      <Button type="button" size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Custom LoRA Input */}
            <div className="border-t pt-3">
              <Label className="text-xs text-muted-foreground">Or add custom LoRA ID:</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  placeholder="civitai:model-id"
                  className="text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        addLoRA(target.value.trim());
                        target.value = '';
                      }
                    }
                  }}
                />
                <Button type="button" size="sm" variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {value.length === 0 && !showBrowser && (
        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          No LoRAs selected. Click "Add LoRA" to enhance your images with artistic styles!
        </p>
      )}
    </div>
  );
}