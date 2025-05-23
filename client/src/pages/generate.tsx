import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateImageRequestSchema, type GenerateImageRequest, type GeneratedImage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Sparkles, ChevronDown, ChevronRight, Sliders, Palette, Camera, Wand2, 
  Brain, Zap, Star, Plus, X, Settings, Lightbulb, ImageIcon, 
  Shuffle, Copy, Download, Share, Eye
} from "lucide-react";

interface ImageGenerationResponse {
  success: boolean;
  data: {
    id: string;
    imageUrls: string[];
    prompt: string;
    status: string;
  };
  requestId: string;
}

// Enhanced model definitions with more details
const AI_MODELS = {
  general: [
    {
      id: "runware:100@1",
      name: "Runware Foundation",
      description: "Premium general-purpose model with exceptional quality",
      category: "Foundation",
      icon: Brain,
      popular: true,
      features: ["High Quality", "Fast", "Versatile"]
    },
    {
      id: "flux/schnell",
      name: "Flux Schnell",
      description: "Lightning-fast generation without sacrificing quality",
      category: "Speed",
      icon: Zap,
      popular: true,
      features: ["Ultra Fast", "Good Quality", "Real-time"]
    }
  ],
  artistic: [
    {
      id: "flux/dev",
      name: "Flux Development",
      description: "Cutting-edge experimental model with latest features",
      category: "Experimental",
      icon: Sparkles,
      popular: true,
      features: ["Latest Tech", "Experimental", "High Detail"]
    },
    {
      id: "sdxl/base",
      name: "SDXL Foundation",
      description: "Industry-standard for photorealistic imagery",
      category: "Photorealistic",
      icon: Camera,
      features: ["Photorealistic", "Stable", "Professional"]
    }
  ],
  specialized: [
    {
      id: "artistic/anime",
      name: "Anime Master Pro",
      description: "Specialized for anime, manga, and illustration styles",
      category: "Anime",
      icon: Palette,
      features: ["Anime Style", "Vibrant Colors", "Character Focus"]
    }
  ]
};

// Enhanced LoRA collection with categories
const LORA_COLLECTION = {
  style: [
    {
      id: "realistic/photoreal",
      name: "PhotoRealistic Pro",
      description: "Enhances photorealism and fine details",
      category: "Realism",
      icon: Camera,
      defaultWeight: 0.8,
      tags: ["photorealistic", "detailed", "professional"]
    },
    {
      id: "artistic/oil-painting",
      name: "Master Oil Painting",
      description: "Classic oil painting artistic style",
      category: "Classical Art",
      icon: Palette,
      defaultWeight: 1.0,
      tags: ["artistic", "classical", "painterly"]
    },
    {
      id: "style/anime-v2",
      name: "Anime Studio",
      description: "High-quality anime and manga style enhancement",
      category: "Anime",
      icon: Sparkles,
      defaultWeight: 1.2,
      tags: ["anime", "manga", "vibrant"]
    }
  ],
  enhancement: [
    {
      id: "enhance/detail-master",
      name: "Detail Master",
      description: "Dramatically improves texture and fine details",
      category: "Enhancement",
      icon: Eye,
      defaultWeight: 0.6,
      tags: ["details", "texture", "sharp"]
    },
    {
      id: "lighting/cinematic",
      name: "Cinematic Lighting",
      description: "Professional movie-quality lighting effects",
      category: "Lighting",
      icon: Wand2,
      defaultWeight: 0.7,
      tags: ["cinematic", "dramatic", "moody"]
    }
  ]
};

const QUICK_PROMPTS = [
  "A serene mountain lake at sunset with golden reflections, photorealistic, 8k",
  "Futuristic cityscape with flying cars and neon lights, cyberpunk style",
  "Cozy coffee shop interior on a rainy day, warm lighting, atmospheric",
  "Magical enchanted forest with glowing mushrooms and fairy lights",
  "Minimalist modern living room with natural lighting, Scandinavian design",
  "Vintage classic car on scenic coastal highway, golden hour photography"
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)", description: "Perfect for social media" },
  { value: "16:9", label: "Landscape (16:9)", description: "Widescreen format" },
  { value: "9:16", label: "Portrait (9:16)", description: "Mobile-friendly" },
  { value: "4:3", label: "Standard (4:3)", description: "Classic photography" },
  { value: "3:4", label: "Portrait (3:4)", description: "Tall format" }
];

const SCHEDULERS = [
  { value: "euler", label: "Euler", description: "Balanced quality and speed" },
  { value: "euler_ancestral", label: "Euler Ancestral", description: "More creative results" },
  { value: "dpm_solver", label: "DPM Solver", description: "High quality, slower" },
  { value: "ddim", label: "DDIM", description: "Deterministic results" },
  { value: "plms", label: "PLMS", description: "Fast convergence" }
];

export default function Generate() {
  const [activeTab, setActiveTab] = useState("basic");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedLoras, setSelectedLoras] = useState<Array<{model: string; weight: number}>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GenerateImageRequest>({
    resolver: zodResolver(generateImageRequestSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      aspectRatio: "1:1",
      numImages: 1,
      model: "runware:100@1",
      loras: [],
      steps: 20,
      cfgScale: 7,
    },
  });

  const generateImagesMutation = useMutation<ImageGenerationResponse, Error, GenerateImageRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/generate-images", {
        ...data,
        loras: selectedLoras
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Images Generated Successfully! 🎨",
        description: `Created ${data.data.imageUrls.length} stunning images`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      form.reset();
      setSelectedLoras([]);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateImageRequest) => {
    generateImagesMutation.mutate(data);
  };

  const addQuickPrompt = (prompt: string) => {
    form.setValue("prompt", prompt);
  };

  const addLora = (lora: any) => {
    if (!selectedLoras.find(l => l.model === lora.id)) {
      setSelectedLoras([...selectedLoras, { model: lora.id, weight: lora.defaultWeight }]);
    }
  };

  const removeLora = (index: number) => {
    setSelectedLoras(selectedLoras.filter((_, i) => i !== index));
  };

  const updateLoraWeight = (index: number, weight: number) => {
    const updated = [...selectedLoras];
    updated[index] = { ...updated[index], weight };
    setSelectedLoras(updated);
  };

  const getLoraName = (model: string) => {
    const allLoras = [...LORA_COLLECTION.style, ...LORA_COLLECTION.enhancement];
    return allLoras.find(l => l.id === model)?.name || model;
  };

  const generateRandomSeed = () => {
    const seed = Math.floor(Math.random() * 1000000);
    form.setValue("seed", seed);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          AI Image Studio
        </h1>
        <p className="text-lg text-muted-foreground">
          Create stunning AI-generated artwork with professional-grade controls
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Prompt
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Models
              </TabsTrigger>
              <TabsTrigger value="style" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Style
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Basic Prompt Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Describe Your Vision
                  </CardTitle>
                  <CardDescription>
                    Write a detailed description of the image you want to create
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A majestic dragon soaring through clouds at sunset, detailed fantasy art, cinematic lighting..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quick Prompts */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Quick Start Ideas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {QUICK_PROMPTS.map((prompt, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addQuickPrompt(prompt)}
                          className="text-left h-auto p-3 justify-start"
                        >
                          <span className="text-xs line-clamp-2">{prompt}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Ratio & Count */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aspectRatio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aspect Ratio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ASPECT_RATIOS.map((ratio) => (
                                <SelectItem key={ratio.value} value={ratio.value}>
                                  <div>
                                    <div className="font-medium">{ratio.label}</div>
                                    <div className="text-xs text-muted-foreground">{ratio.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numImages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Images</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 Image</SelectItem>
                              <SelectItem value="2">2 Images</SelectItem>
                              <SelectItem value="3">3 Images</SelectItem>
                              <SelectItem value="4">4 Images</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Models Tab */}
            <TabsContent value="models" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Model Selection
                  </CardTitle>
                  <CardDescription>
                    Choose the AI model that best fits your creative needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        {Object.entries(AI_MODELS).map(([category, models]) => (
                          <div key={category} className="space-y-3">
                            <h4 className="text-sm font-medium capitalize text-muted-foreground">
                              {category} Models
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {models.map((model) => {
                                const Icon = model.icon;
                                const isSelected = field.value === model.id;
                                
                                return (
                                  <Card
                                    key={model.id}
                                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                      isSelected 
                                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30" 
                                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    }`}
                                    onClick={() => field.onChange(model.id)}
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
                                          <div className="flex items-center space-x-2 mb-1">
                                            <h4 className="text-sm font-medium">{model.name}</h4>
                                            {model.popular && (
                                              <Badge variant="secondary" className="text-xs">
                                                <Star className="h-3 w-3 mr-1" />
                                                Popular
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground mb-2">
                                            {model.description}
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {model.features.map((feature) => (
                                              <Badge key={feature} variant="outline" className="text-xs">
                                                {feature}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Style (LoRA) Tab */}
            <TabsContent value="style" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Style Enhancers (LoRAs)
                  </CardTitle>
                  <CardDescription>
                    Add artistic styles and enhancements to customize your images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Selected LoRAs */}
                  {selectedLoras.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Active Style Enhancers</h4>
                      {selectedLoras.map((lora, index) => (
                        <Card key={index} className="border-dashed">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">
                                  {getLoraName(lora.model)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Strength: {lora.weight.toFixed(1)}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLora(index)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Influence Strength</span>
                                <span>{lora.weight.toFixed(1)}</span>
                              </div>
                              <Slider
                                value={[lora.weight]}
                                onValueChange={([weight]) => updateLoraWeight(index, weight)}
                                max={2}
                                min={0}
                                step={0.1}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Subtle</span>
                                <span>Strong</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Separator />
                    </div>
                  )}

                  {/* Available LoRAs */}
                  {Object.entries(LORA_COLLECTION).map(([category, loras]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-sm font-medium capitalize text-muted-foreground">
                        {category} Enhancers
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {loras.filter(lora => !selectedLoras.find(l => l.model === lora.id)).map((lora) => {
                          const Icon = lora.icon;
                          
                          return (
                            <div
                              key={lora.id}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                              onClick={() => addLora(lora)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                                  <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">{lora.name}</h4>
                                  <p className="text-xs text-muted-foreground">{lora.description}</p>
                                  <div className="flex space-x-1 mt-1">
                                    {lora.tags.map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Generation Settings
                  </CardTitle>
                  <CardDescription>
                    Fine-tune the generation process for optimal results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Negative Prompt */}
                  <FormField
                    control={form.control}
                    name="negativePrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Negative Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="blur, distortion, low quality, deformed, ugly..."
                            className="min-h-[80px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Generation Parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="steps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Steps ({field.value})</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={([value]) => field.onChange(value)}
                                max={100}
                                min={1}
                                step={1}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Fast (1)</span>
                                <span>High Quality (100)</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cfgScale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CFG Scale ({field.value})</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={([value]) => field.onChange(value)}
                                max={20}
                                min={1}
                                step={0.5}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Creative (1)</span>
                                <span>Precise (20)</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Seed and Scheduler */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="seed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seed (Optional)</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Random"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={generateRandomSeed}
                            >
                              <Shuffle className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduler"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduler</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Default" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SCHEDULERS.map((scheduler) => (
                                <SelectItem key={scheduler.value} value={scheduler.value}>
                                  <div>
                                    <div className="font-medium">{scheduler.label}</div>
                                    <div className="text-xs text-muted-foreground">{scheduler.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Generation Progress */}
          {generateImagesMutation.isPending && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Creating Your Masterpiece...
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This usually takes 10-30 seconds depending on complexity
                    </p>
                  </div>
                </div>
                <Progress value={60} className="mt-4" />
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          <Button 
            type="submit" 
            disabled={generateImagesMutation.isPending}
            className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Sparkles className="h-6 w-6 mr-3" />
            {generateImagesMutation.isPending ? "Creating Magic..." : "Generate Images"}
          </Button>
        </form>
      </Form>
    </div>
  );
}