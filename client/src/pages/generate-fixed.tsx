import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SEOHead } from "@/components/SEOHead";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, ChevronDown, ChevronRight, Sliders, Camera, Wand2, 
  Brain, Zap, Star, Plus, X, Lightbulb, ImageIcon, 
  Shuffle, Copy, Download, Share, Eye, Menu, ArrowLeft, Grid, List,
  Square, RectangleHorizontal, MonitorSpeaker, Smartphone, Tablet
} from "lucide-react";
import { TradingCard } from "@/components/TradingCard";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { generateImageRequestSchema, type GenerateImageRequest } from "@shared/schema";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

interface ImageGenerationResponse {
  success: boolean;
  images: any[];
  requestId: string;
}

export default function Generate() {
  // ALL HOOKS DECLARED FIRST - NEVER CONDITIONAL
  
  // State hooks
  const [activeTab, setActiveTab] = useState("create");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [highlightPrompt, setHighlightPrompt] = useState(false);
  const [newlyCreatedImageIds, setNewlyCreatedImageIds] = useState<number[]>([]);
  const [showCompletedImages, setShowCompletedImages] = useState(false);
  const [completedImages, setCompletedImages] = useState<any[]>([]);

  const [galleryView, setGalleryView] = useState<"grid" | "list">("grid");
  
  // Context and custom hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Form hook
  const form = useForm<GenerateImageRequest>({
    resolver: zodResolver(generateImageRequestSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      aspectRatio: "1:1",
      model: "rundiffusion:130@100",
      steps: 30,
      cfgScale: 7,
      scheduler: "DPMSolverMultistepScheduler",
    },
  });

  // Query hooks
  const { data: allImages = [], refetch } = useQuery({
    queryKey: ["/api/images/my"],
    queryFn: () => fetch("/api/images/my").then(res => res.json()),
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: modelsResponse } = useQuery({
    queryKey: ["/api/v1/models/catalog"],
    queryFn: () => fetch("/api/v1/models/catalog").then(res => res.json()),
  });

  const { data: creditBalance } = useQuery({
    queryKey: ["/api/credits/balance/1"],
    queryFn: () => fetch("/api/credits/balance/1").then(res => res.json()),
    enabled: isAuthenticated && !authLoading,
    refetchInterval: 30000,
  });

  // Mutation hook
  const generateImagesMutation = useMutation<ImageGenerationResponse, Error, GenerateImageRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/generate-images", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Images Generated Successfully!",
        description: "Your masterpiece is ready!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/images/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits/balance/1"] });
      
      setNewlyCreatedImageIds([]);
      
      refetch().then((result) => {
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          const sortedImages = result.data.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          const newestImages = sortedImages.slice(0, data.images?.length || 1);
          const newestImageIds = newestImages.map((img: any) => img.id);
          setNewlyCreatedImageIds(newestImageIds);
          
          if (isMobile) {
            setCompletedImages(newestImages);
            setShowCompletedImages(true);
            setActiveTab("gallery");
          }
          
          setTimeout(() => {
            setNewlyCreatedImageIds([]);
            setShowCompletedImages(false);
          }, 8000);
        }
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Effects
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modelParam = urlParams.get('model');
    
    if (modelParam) {
      form.setValue('model', modelParam);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const promptParam = urlParams.get('prompt');
    const modelParam = urlParams.get('model');
    const aspectRatioParam = urlParams.get('aspectRatio');
    
    if (promptParam || modelParam || aspectRatioParam) {
      if (promptParam) form.setValue('prompt', promptParam);
      if (modelParam) form.setValue('model', modelParam);
      if (aspectRatioParam && ['1:1', '16:9', '9:16', '3:4', '4:3'].includes(aspectRatioParam)) {
        form.setValue('aspectRatio', aspectRatioParam as '1:1' | '16:9' | '9:16' | '3:4' | '4:3');
      }
      
      setHighlightPrompt(true);
      toast({
        title: "Settings Loaded",
        description: "Image settings have been pre-filled from your selection",
      });
      
      setTimeout(() => {
        setHighlightPrompt(false);
        const currentParams = new URLSearchParams(window.location.search);
        const modelParam = currentParams.get('model');
        if (modelParam) {
          window.history.replaceState({}, '', `${window.location.pathname}?model=${encodeURIComponent(modelParam)}`);
        } else {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }, 3000);
    }
  }, [location, form, toast]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/api/login';
    }
  }, [isAuthenticated, authLoading]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Derived values
  const existingImages = Array.isArray(allImages) ? allImages.filter((image: any) => {
    const imageDate = new Date(image.createdAt);
    const today = new Date();
    return (
      imageDate.getDate() === today.getDate() &&
      imageDate.getMonth() === today.getMonth() &&
      imageDate.getFullYear() === today.getFullYear()
    );
  }) : [];

  const availableModels = modelsResponse?.data || [];
  const selectedModel = availableModels.find((model: any) => model.modelId === form.watch('model'));
  const currentModelName = selectedModel?.name || 'Juggernaut Pro Flux';

  // Component functions
  const onSubmit = (data: GenerateImageRequest) => {
    generateImagesMutation.mutate(data);
  };

  const addQuickPrompt = (prompt: string) => {
    form.setValue("prompt", prompt);
  };

  // Mobile-specific components
  const renderMobileLayout = () => (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="AI Art Generator - Create Stunning Digital Artwork"
        description="Generate beautiful AI artwork with professional models. Create, customize, and download your digital masterpieces."
      />
      
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-lg font-semibold">Dream Bees Art</h1>
          <div className="ml-auto flex items-center space-x-2">
            {/* Credit Balance */}
            <div className="flex items-center space-x-1 px-3 py-1 bg-primary/10 rounded-full">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{creditBalance?.balance || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="sticky top-14 z-40 bg-background border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Wand2 className="h-4 w-4" />
              <span>Create</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4" />
              <span>Gallery</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="create" className="p-4 space-y-4">
          {renderCreateForm()}
        </TabsContent>

        <TabsContent value="gallery" className="p-4">
          {renderGalleryContent()}
        </TabsContent>
      </Tabs>

      {/* Mobile Image Success Overlay */}
      {showCompletedImages && completedImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Images Generated!</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowCompletedImages(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {completedImages.slice(0, 4).map((image: any) => (
                  <img
                    key={image.id}
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => {
                  setActiveTab("gallery");
                  setShowCompletedImages(false);
                }}
              >
                View in Gallery
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderDesktopLayout = () => (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="AI Art Generator - Create Stunning Digital Artwork"
        description="Generate beautiful AI artwork with professional models. Create, customize, and download your digital masterpieces."
      />
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Creation Form */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>AI Art Generator</span>
                  </CardTitle>
                  <div className="flex items-center space-x-1 px-3 py-1 bg-primary/10 rounded-full">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{creditBalance?.balance || 0}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderCreateForm()}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Gallery */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Creations</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={galleryView === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGalleryView("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={galleryView === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGalleryView("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderGalleryContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreateForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Model Selection */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Model:</span>
              <span className="text-sm text-blue-700 dark:text-blue-300">{currentModelName}</span>
            </div>
            <Button variant="ghost" size="sm" type="button">
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Prompt Input */}
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4" />
                <span>Describe Your Vision</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A majestic dragon soaring through storm clouds, digital art, highly detailed, 8k resolution..."
                  className={`min-h-[100px] transition-all ${highlightPrompt ? 'ring-2 ring-primary' : ''}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quick Prompt Suggestions */}
        <div className="flex flex-wrap gap-2">
          {[
            "Cyberpunk cityscape at night",
            "Magical forest with glowing mushrooms",
            "Steampunk airship in clouds",
            "Ancient temple ruins",
            "Futuristic robot portrait"
          ].map((prompt) => (
            <Button
              key={prompt}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addQuickPrompt(prompt)}
              className="text-xs"
            >
              {prompt}
            </Button>
          ))}
        </div>

        {/* Aspect Ratio Selection */}
        <FormField
          control={form.control}
          name="aspectRatio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aspect Ratio</FormLabel>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: "1:1", label: "Square", icon: Square },
                  { value: "16:9", label: "Landscape", icon: RectangleHorizontal },
                  { value: "9:16", label: "Portrait", icon: Smartphone },
                  { value: "4:3", label: "Classic", icon: MonitorSpeaker },
                  { value: "3:4", label: "Tall", icon: Tablet }
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={field.value === value ? "default" : "outline"}
                    className="h-16 flex flex-col items-center justify-center p-2"
                    onClick={() => field.onChange(value)}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Advanced Settings Toggle */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="flex items-center space-x-2">
                <Sliders className="h-4 w-4" />
                <span>Advanced Settings</span>
              </span>
              {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {renderAdvancedSettings()}
          </CollapsibleContent>
        </Collapsible>

        {/* Generate Button */}
        <Button 
          type="submit" 
          disabled={generateImagesMutation.isPending}
          className="w-full h-12"
          size="lg"
        >
          {generateImagesMutation.isPending ? (
            <>
              <Sparkles className="mr-2 h-5 w-5 animate-spin" />
              Generating Amazing Art...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate Image
            </>
          )}
        </Button>
      </form>
    </Form>
  );

  const renderAdvancedSettings = () => (
    <>
      {/* Model Selection */}
      <FormField
        control={form.control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>AI Model</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableModels.map((model: any) => (
                  <SelectItem key={model.modelId} value={model.modelId}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Negative Prompt */}
      <FormField
        control={form.control}
        name="negativePrompt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Negative Prompt (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What to avoid in the image..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Steps */}
      <FormField
        control={form.control}
        name="steps"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Steps: {field.value}</FormLabel>
            <FormControl>
              <Slider
                min={10}
                max={50}
                step={1}
                value={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* CFG Scale */}
      <FormField
        control={form.control}
        name="cfgScale"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CFG Scale: {field.value}</FormLabel>
            <FormControl>
              <Slider
                min={1}
                max={20}
                step={0.5}
                value={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Scheduler */}
      <FormField
        control={form.control}
        name="scheduler"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Scheduler</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="DPMSolverMultistepScheduler">DPM++ Multistep</SelectItem>
                <SelectItem value="EulerDiscreteScheduler">Euler</SelectItem>
                <SelectItem value="EulerAncestralDiscreteScheduler">Euler Ancestral</SelectItem>
                <SelectItem value="DDIMScheduler">DDIM</SelectItem>
                <SelectItem value="LMSDiscreteScheduler">LMS</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderGalleryContent = () => {
    if (existingImages.length === 0) {
      return (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No images yet</h3>
          <p className="text-muted-foreground mb-4">Create your first masterpiece to see it here</p>
          <Button onClick={() => setActiveTab("create")}>
            <Wand2 className="mr-2 h-4 w-4" />
            Start Creating
          </Button>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[600px]">
        <div className={galleryView === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {existingImages.map((image: any) => (
            galleryView === "grid" ? (
              <div key={image.id} className="relative">
                <TradingCard
                  image={{
                    id: image.id.toString(),
                    imageUrl: image.imageUrl,
                    prompt: image.prompt,
                    model: image.modelId,
                    createdAt: image.createdAt,
                    rarityTier: image.rarityTier || 'COMMON',
                    rarityScore: image.rarityScore || 0,
                    rarityStars: image.rarityStars || 1,
                    rarityLetter: image.rarityLetter || 'C'
                  }}
                  isNewest={newlyCreatedImageIds.includes(image.id)}
                />
                {newlyCreatedImageIds.includes(image.id) && (
                  <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse pointer-events-none" />
                )}
              </div>
            ) : (
              <div 
                key={image.id} 
                className="flex space-x-4 p-4 border rounded-lg"
              >
                <div className="w-24 h-24 flex-shrink-0 relative">
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {newlyCreatedImageIds.includes(image.id) && (
                    <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{image.prompt}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {image.aspectRatio}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Share className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </ScrollArea>
    );
  };

  // Main render logic
  return isMobile ? renderMobileLayout() : renderDesktopLayout();
}