import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Sparkles, ChevronDown, ChevronRight, Sliders, Camera, Wand2, 
  Brain, Zap, Star, Plus, X, Settings, Lightbulb, ImageIcon, 
  Shuffle, Copy, Download, Share, Eye, Menu, ArrowLeft, Grid, List,
  Square, RectangleHorizontal, MonitorSpeaker, Smartphone, Tablet
} from "lucide-react";
import { TradingCard } from "@/components/TradingCard";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { generateImageRequestSchema, type GenerateImageRequest } from "@shared/schema";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImageGenerationResponse {
  success: boolean;
  images: any[];
  requestId: string;
}

export default function Generate() {
  const [activeTab, setActiveTab] = useState("create");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [highlightPrompt, setHighlightPrompt] = useState(false);
  const [newlyCreatedImageIds, setNewlyCreatedImageIds] = useState<number[]>([]);

  const [showSettings, setShowSettings] = useState(false);
  const [galleryView, setGalleryView] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [location] = useLocation();

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

  // Handle parameters from URL (when clicking from home feed)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const promptParam = urlParams.get('prompt');
    const modelParam = urlParams.get('model');
    const aspectRatioParam = urlParams.get('aspectRatio');
    
    // Only trigger highlighting and toast if there are actual parameters from home feed
    if (promptParam || modelParam || aspectRatioParam) {
      // Set form values from URL parameters
      if (promptParam) {
        form.setValue('prompt', promptParam);
      }
      if (modelParam) {
        form.setValue('model', modelParam);
      }
      if (aspectRatioParam && ['1:1', '16:9', '9:16', '3:4', '4:3'].includes(aspectRatioParam)) {
        form.setValue('aspectRatio', aspectRatioParam as '1:1' | '16:9' | '9:16' | '3:4' | '4:3');
      }
      
      // Show toast to indicate settings were loaded and highlight prompt
      setHighlightPrompt(true);
      toast({
        title: "Settings Loaded",
        description: "Image settings have been pre-filled from your selection",
      });
      
      // Remove highlight after 3 seconds and clear URL params
      setTimeout(() => {
        setHighlightPrompt(false);
        // Clear URL parameters to prevent highlighting on refresh
        window.history.replaceState({}, '', window.location.pathname);
      }, 3000);
    } else {
      // Default to Juggernaut Pro Flux if no model is selected
      form.setValue('model', 'rundiffusion:130@100');
    }
  }, [location, form, toast]);

  // Check authentication status first
  const { data: authStatus } = useQuery<{ isAuthenticated: boolean; user?: any }>({
    queryKey: ['/api/auth/profile'],
    refetchInterval: 60000, // Check auth less frequently
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Fetch existing images for authenticated user (today only)
  const { data: allImages = [], refetch } = useQuery({
    queryKey: ["/api/images/my"],
    queryFn: () => fetch("/api/images/my").then(res => res.json()),
    enabled: authStatus?.isAuthenticated || false, // Only fetch if authenticated
    refetchInterval: 60000, // Refresh every minute instead of default
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Filter images to show only today's generations
  const existingImages = Array.isArray(allImages) ? allImages.filter((image: any) => {
    const imageDate = new Date(image.createdAt);
    const today = new Date();
    return (
      imageDate.getDate() === today.getDate() &&
      imageDate.getMonth() === today.getMonth() &&
      imageDate.getFullYear() === today.getFullYear()
    );
  }) : [];

  // Fetch available models
  const { data: modelsResponse } = useQuery({
    queryKey: ["/api/v1/models/catalog"],
    queryFn: () => fetch("/api/v1/models/catalog").then(res => res.json()),
  });

  const availableModels = modelsResponse?.data || [];
  
  // Get the currently selected model info
  const selectedModel = availableModels.find((model: any) => model.modelId === form.watch('model'));
  const currentModelName = selectedModel?.name || 'Juggernaut Pro Flux';

  const generateImagesMutation = useMutation<ImageGenerationResponse, Error, GenerateImageRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/generate-images", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Images Generated Successfully! 🎨",
        description: `Your masterpiece has been added to the gallery! ${data.creditsUsed ? `Used ${data.creditsUsed} credits` : ''}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/images/my"] });
      // Refresh credit balance to show updated amount
      queryClient.invalidateQueries({ queryKey: ["/api/credits/balance/1"] });
      
      // Clear any existing highlights first
      setNewlyCreatedImageIds([]);
      
      refetch().then((result) => {
        // Mark newly created images for highlighting (get the most recent ones)
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          // Sort by creation time and get the newest images
          const sortedImages = result.data.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          // Highlight the newest image(s) - assuming we generated 1 image typically
          const newestImageIds = sortedImages.slice(0, data.images?.length || 1).map((img: any) => img.id);
          setNewlyCreatedImageIds(newestImageIds);
          
          // Remove the highlight after 8 seconds for better visibility
          setTimeout(() => {
            setNewlyCreatedImageIds([]);
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

  const onSubmit = (data: GenerateImageRequest) => {
    generateImagesMutation.mutate(data);
  };

  const addQuickPrompt = (prompt: string) => {
    form.setValue("prompt", prompt);
  };

  const renderMobileCreateForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Selected Model Display */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Selected Model:</span>
            <span className="text-sm text-blue-700 dark:text-blue-300">{currentModelName}</span>
          </div>
        </div>

        {/* Prompt Input - Mobile Optimized */}
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2 text-base font-medium">
                <Lightbulb className="h-4 w-4" />
                <span>Describe Your Vision</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A serene mountain lake at sunset with golden reflections, photorealistic, 8k..."
                  className="min-h-[120px] resize-none text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        {/* Essential Settings - Mobile */}
        <div className="space-y-4">
          {/* Aspect Ratio Cards - Mobile Optimized */}
          <FormField
            control={form.control}
            name="aspectRatio"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-medium">Select a Size</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { 
                        value: "1:1", 
                        label: "Square", 
                        description: "Perfect for social media",
                        icon: Square,
                        iconSize: "w-5 h-5",
                        popular: true
                      },
                      { 
                        value: "4:3", 
                        label: "Landscape", 
                        description: "Classic photo format",
                        icon: RectangleHorizontal,
                        iconSize: "w-6 h-4",
                        popular: false
                      },
                      { 
                        value: "16:9", 
                        label: "Widescreen", 
                        description: "Cinematic format",
                        icon: MonitorSpeaker,
                        iconSize: "w-6 h-4",
                        popular: false
                      },
                      { 
                        value: "3:4", 
                        label: "Portrait", 
                        description: "Tall format",
                        icon: Tablet,
                        iconSize: "w-4 h-6",
                        popular: false
                      },
                      { 
                        value: "9:16", 
                        label: "Mobile", 
                        description: "Stories & reels",
                        icon: Smartphone,
                        iconSize: "w-4 h-6",
                        popular: true
                      }
                    ].map((ratio) => (
                      <div key={ratio.value} className="relative">
                        <Button
                          type="button"
                          variant={field.value === ratio.value ? "default" : "outline"}
                          onClick={() => field.onChange(ratio.value)}
                          className={`w-full h-20 p-3 flex flex-col items-center justify-center relative transition-all duration-200 ${
                            field.value === ratio.value 
                              ? "ring-2 ring-primary ring-offset-2 shadow-md" 
                              : "hover:shadow-sm"
                          }`}
                        >
                          {/* Icon Representation */}
                          <div className="flex items-center justify-center mb-2">
                            <ratio.icon className={`${ratio.iconSize} ${
                              field.value === ratio.value ? "text-primary-foreground" : "text-muted-foreground"
                            }`} />
                          </div>
                          
                          {/* Labels */}
                          <div className="text-center">
                            <div className="text-xs font-semibold">{ratio.label}</div>
                            <div className="text-xs text-muted-foreground">{ratio.value}</div>
                          </div>
                          
                          {/* Popular Badge */}
                          {ratio.popular && (
                            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                              <Star className="w-2 h-2" />
                            </div>
                          )}
                        </Button>
                        
                        {/* Description Tooltip on Selection */}
                        {field.value === ratio.value && (
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap z-10">
                            {ratio.description}
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          {/* Quick Quality Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel className="text-sm font-medium">Quality & Speed</FormLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("settings")}
                className="text-xs h-6"
              >
                Advanced <Settings className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {/* Steps - Mobile Optimized */}
            <FormField
              control={form.control}
              name="steps"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm">Steps</FormLabel>
                    <Badge variant={field.value >= 40 ? "default" : field.value >= 25 ? "secondary" : "outline"} className="text-xs">
                      {field.value >= 40 ? "Ultra" : field.value >= 25 ? "High" : "Standard"}
                    </Badge>
                  </div>
                  <FormControl>
                    <div className="space-y-1">
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={50}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Fast</span>
                        <span className="font-medium">{field.value}</span>
                        <span>Quality</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CFG Scale - Mobile Optimized */}
            <FormField
              control={form.control}
              name="cfgScale"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm">Guidance</FormLabel>
                    <Badge variant={field.value >= 12 ? "destructive" : field.value >= 8 ? "default" : "secondary"} className="text-xs">
                      {field.value >= 12 ? "Strong" : field.value >= 8 ? "Balanced" : "Creative"}
                    </Badge>
                  </div>
                  <FormControl>
                    <div className="space-y-1">
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={20}
                        min={1}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Creative</span>
                        <span className="font-medium">{field.value}</span>
                        <span>Precise</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Number of Images - Mobile Optimized */}
            <FormField
              control={form.control}
              name="numImages"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm">Images</FormLabel>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">{field.value || 1}</Badge>
                      {(field.value || 1) > 1 && (
                        <Badge variant="secondary" className="text-xs">{(field.value || 1)}x cost</Badge>
                      )}
                    </div>
                  </div>
                  <FormControl>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4].map((num) => (
                        <Button
                          key={num}
                          type="button"
                          variant={(field.value || 1) === num ? "default" : "outline"}
                          size="sm"
                          onClick={() => field.onChange(num)}
                          className="h-8 text-xs"
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium">Quick Presets</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue("steps", 20);
                  form.setValue("cfgScale", 7);
                }}
                className="h-10 flex flex-col py-1"
              >
                <Zap className="h-3 w-3 mb-1" />
                <span className="text-xs">Fast</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue("steps", 40);
                  form.setValue("cfgScale", 8);
                }}
                className="h-10 flex flex-col py-1"
              >
                <Star className="h-3 w-3 mb-1" />
                <span className="text-xs">Quality</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile */}
        <div className="space-y-3">
          {/* Generate Button */}
          <Button 
            type="submit" 
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            disabled={generateImagesMutation.isPending}
          >
            {generateImagesMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Magic...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5" />
                <span>Generate Artwork</span>
              </div>
            )}
          </Button>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => form.reset()}
              className="h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("gallery")}
              className="h-10"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Gallery
            </Button>
          </div>
        </div>

        {/* Loading State - Mobile */}
        {generateImagesMutation.isPending && (
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <div>
                  <h3 className="font-medium text-primary">
                    Creating Your Masterpiece ✨
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI is working its magic...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );

  const renderMobileGallery = () => (
    <div className="space-y-4">
      {/* Gallery Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <div>
            <h2 className="text-lg font-semibold">Today's Gallery</h2>
            <p className="text-xs text-muted-foreground">
              {Array.isArray(existingImages) ? existingImages.length : 0} created today
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={galleryView === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setGalleryView("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={galleryView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setGalleryView("list")}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {Array.isArray(existingImages) && existingImages.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-lg font-semibold text-primary">
              {existingImages.length}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-semibold text-green-600">
              {existingImages.filter((img: any) => img.rarityTier !== 'COMMON').length}
            </div>
            <div className="text-xs text-muted-foreground">Rare+</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-semibold text-orange-600">
              {existingImages.filter((img: any) => {
                const today = new Date();
                const imageDate = new Date(img.createdAt);
                return today.toDateString() === imageDate.toDateString();
              }).length}
            </div>
            <div className="text-xs text-muted-foreground">Today</div>
          </Card>
        </div>
      )}

      {/* Images Grid - Mobile Optimized */}
      {Array.isArray(existingImages) && existingImages.length > 0 ? (
        <div className={
          galleryView === "grid" 
            ? "grid grid-cols-2 gap-3 pb-20" 
            : "space-y-3 pb-20"
        }>
          {existingImages
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((image: any, index: number) => (
            <div 
              key={image.id}
              className={`${galleryView === "list" ? "animate-in slide-in-from-left duration-300" : "animate-in fade-in duration-300"}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TradingCard
                image={{
                  id: image.id,
                  imageUrl: image.imageUrl,
                  prompt: image.prompt,
                  model: image.model,
                  dimensions: { width: 512, height: 512 },
                  createdAt: image.createdAt,
                  rarityTier: image.rarityTier || 'COMMON',
                  rarityScore: image.rarityScore || 50,
                  rarityStars: image.rarityStars || 1,
                  rarityLetter: image.rarityLetter || 'S',
                }}
                isNewest={newlyCreatedImageIds.includes(image.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-8">
              <ImageIcon className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Your creative journey starts here
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
            Generate stunning AI artwork with just a few words. Your creations will appear here as collectible trading cards with unique rarity levels.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setActiveTab("create")}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Create your first masterpiece
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab("settings")}
              className="text-sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Explore advanced settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6 pb-6">
      {/* Quality Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Sliders className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-lg">Quality Settings</h3>
        </div>
        
        {/* Steps with Visual Indicator */}
        <FormField
          control={form.control}
          name="steps"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">Generation Steps</FormLabel>
                <Badge variant={field.value >= 40 ? "default" : field.value >= 25 ? "secondary" : "outline"}>
                  {field.value >= 40 ? "Ultra" : field.value >= 25 ? "High" : "Standard"}
                </Badge>
              </div>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={50}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>Fast (10)</span>
                    <span className="font-medium">{field.value}</span>
                    <span>Ultra (50)</span>
                  </div>
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground">Higher values = better quality, longer generation time</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CFG Scale with Visual Indicator */}
        <FormField
          control={form.control}
          name="cfgScale"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">Guidance Scale</FormLabel>
                <Badge variant={field.value >= 12 ? "destructive" : field.value >= 8 ? "default" : "secondary"}>
                  {field.value >= 12 ? "Strong" : field.value >= 8 ? "Balanced" : "Loose"}
                </Badge>
              </div>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={20}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>Creative (1)</span>
                    <span className="font-medium">{field.value}</span>
                    <span>Strict (20)</span>
                  </div>
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground">How closely AI follows your prompt</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Number of Images with Cost Indicator */}
        <FormField
          control={form.control}
          name="numImages"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">Number of Images</FormLabel>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{field.value || 1} image{(field.value || 1) > 1 ? 's' : ''}</Badge>
                  {(field.value || 1) > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      {(field.value || 1)}x cost
                    </Badge>
                  )}
                </div>
              </div>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    value={[field.value || 1]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={4}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground">
                    {[1, 2, 3, 4].map((num) => (
                      <div 
                        key={num}
                        className={`text-center p-1 rounded ${
                          (field.value || 1) === num ? 'bg-primary text-primary-foreground' : ''
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Technical Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-lg">Technical Settings</h3>
        </div>

        {/* Scheduler with Descriptions */}
        <FormField
          control={form.control}
          name="scheduler"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">Sampling Method</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select sampling method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DPMSolverMultistepScheduler" className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">DPM++ 2M</span>
                        <span className="text-xs text-muted-foreground">Recommended - Best quality/speed balance</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EulerDiscreteScheduler" className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">Euler</span>
                        <span className="text-xs text-muted-foreground">Fast generation, good for sketches</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EulerAncestralDiscreteScheduler" className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">Euler Ancestral</span>
                        <span className="text-xs text-muted-foreground">More creative, less predictable</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="DDIMScheduler" className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">DDIM</span>
                        <span className="text-xs text-muted-foreground">Classic method, very stable</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="LMSDiscreteScheduler" className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">LMS</span>
                        <span className="text-xs text-muted-foreground">Balanced approach, good details</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="UniPCMultistepScheduler" className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">UniPC</span>
                        <span className="text-xs text-muted-foreground">High quality, slower generation</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Seed with Random Generator */}
        <FormField
          control={form.control}
          name="seed"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">Seed (Reproducibility)</FormLabel>
              <FormControl>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Leave empty for random..."
                    type="number"
                    className="flex-1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => field.onChange(Math.floor(Math.random() * 1000000))}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground">Use same seed to reproduce identical results</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Creative Controls Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-lg">Creative Controls</h3>
        </div>

        {/* Negative Prompt with Smart Suggestions */}
        <FormField
          control={form.control}
          name="negativePrompt"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">Negative Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Things to avoid: blurry, low quality, distorted, watermark..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <div className="flex flex-wrap gap-1">
                {["blurry", "low quality", "distorted", "watermark", "text", "bad anatomy"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      const current = field.value || "";
                      const newValue = current ? `${current}, ${suggestion}` : suggestion;
                      field.onChange(newValue);
                    }}
                  >
                    +{suggestion}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />


      </div>

      {/* Quick Presets */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Star className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-lg">Quick Presets</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              form.setValue("steps", 20);
              form.setValue("cfgScale", 7);
              form.setValue("scheduler", "EulerDiscreteScheduler");
            }}
            className="h-auto p-3 flex flex-col"
          >
            <Zap className="h-4 w-4 mb-1" />
            <span className="text-xs font-medium">Fast Mode</span>
            <span className="text-xs text-muted-foreground">Quick results</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              form.setValue("steps", 40);
              form.setValue("cfgScale", 8);
              form.setValue("scheduler", "DPMSolverMultistepScheduler");
            }}
            className="h-auto p-3 flex flex-col"
          >
            <Star className="h-4 w-4 mb-1" />
            <span className="text-xs font-medium">Quality Mode</span>
            <span className="text-xs text-muted-foreground">Best results</span>
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="font-semibold text-lg">Dream Bees Art</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {Array.isArray(existingImages) ? existingImages.length : 0}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Advanced Settings</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100vh-60px)]">
          <div className="border-b bg-background/95 backdrop-blur">
            <TabsList className="grid w-full grid-cols-3 h-12 mx-4 my-2">
              <TabsTrigger value="create" className="text-sm">
                <Wand2 className="h-4 w-4 mr-1" />
                Create
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="gallery" className="text-sm">
                <ImageIcon className="h-4 w-4 mr-1" />
                Gallery
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="create" className="flex-1 p-4 space-y-4 overflow-auto">
            {renderMobileCreateForm()}
          </TabsContent>

          <TabsContent value="settings" className="flex-1 p-4 overflow-auto">
            <Form {...form}>
              {renderAdvancedSettings()}
            </Form>
          </TabsContent>

          <TabsContent value="gallery" className="flex-1 p-4 overflow-auto">
            {renderMobileGallery()}
          </TabsContent>
        </Tabs>

        {/* Floating Generate Button - Shows on Gallery/Settings tabs */}
        {(activeTab === "gallery" || activeTab === "settings") && (
          <div className="fixed bottom-6 right-4 z-50">
            <Button
              onClick={() => setActiveTab("create")}
              className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="icon"
            >
              <Wand2 className="h-6 w-6" />
              <span className="sr-only">Create new artwork</span>
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation Header */}
      <NavigationHeader activeItem="create"  />

      {/* Desktop Layout */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-120px)]">
          
          {/* Left Sidebar - Generation Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Create Artwork</h2>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      
                      {/* Selected Model Display */}
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Selected Model:</span>
                          <span className="text-sm text-blue-700 dark:text-blue-300">{currentModelName}</span>
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
                                placeholder="A serene mountain lake at sunset with golden reflections, photorealistic, 8k..."
                                className={`min-h-[100px] resize-none transition-all duration-500 ${
                                  highlightPrompt 
                                    ? 'ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary animate-pulse' 
                                    : ''
                                }`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />



                      {/* Aspect Ratio - Desktop with Mobile Styling */}
                      <FormField
                        control={form.control}
                        name="aspectRatio"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-medium">Select a Size</FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-5 gap-3">
                                {[
                                  { 
                                    value: "1:1", 
                                    label: "Square", 
                                    description: "Perfect for social media",
                                    icon: Square,
                                    iconSize: "w-5 h-5",
                                    popular: true
                                  },
                                  { 
                                    value: "4:3", 
                                    label: "Landscape", 
                                    description: "Classic photo format",
                                    icon: RectangleHorizontal,
                                    iconSize: "w-6 h-4",
                                    popular: false
                                  },
                                  { 
                                    value: "16:9", 
                                    label: "Widescreen", 
                                    description: "Cinematic format",
                                    icon: MonitorSpeaker,
                                    iconSize: "w-6 h-4",
                                    popular: false
                                  },
                                  { 
                                    value: "3:4", 
                                    label: "Portrait", 
                                    description: "Tall format",
                                    icon: Tablet,
                                    iconSize: "w-4 h-6",
                                    popular: false
                                  },
                                  { 
                                    value: "9:16", 
                                    label: "Mobile", 
                                    description: "Stories & reels",
                                    icon: Smartphone,
                                    iconSize: "w-4 h-6",
                                    popular: true
                                  }
                                ].map((ratio) => (
                                  <div key={ratio.value} className="relative">
                                    <Button
                                      type="button"
                                      variant={field.value === ratio.value ? "default" : "outline"}
                                      onClick={() => field.onChange(ratio.value)}
                                      className={`w-full h-20 p-3 flex flex-col items-center justify-center relative transition-all duration-200 ${
                                        field.value === ratio.value 
                                          ? "ring-2 ring-primary ring-offset-2 shadow-md" 
                                          : "hover:shadow-sm"
                                      }`}
                                    >
                                      {/* Icon Representation */}
                                      <div className="flex items-center justify-center mb-2">
                                        <ratio.icon className={`${ratio.iconSize} ${
                                          field.value === ratio.value ? "text-primary-foreground" : "text-muted-foreground"
                                        }`} />
                                      </div>
                                      
                                      {/* Labels */}
                                      <div className="text-center">
                                        <div className="text-xs font-semibold">{ratio.label}</div>
                                        <div className="text-xs text-muted-foreground">{ratio.value}</div>
                                      </div>
                                      
                                      {/* Popular Badge */}
                                      {ratio.popular && (
                                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                                          <Star className="w-2 h-2" />
                                        </div>
                                      )}
                                    </Button>
                                    
                                    {/* Description Tooltip on Selection */}
                                    {field.value === ratio.value && (
                                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap z-10">
                                        {ratio.description}
                                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />



                      {/* Advanced Settings */}
                      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="flex items-center justify-between w-full p-0">
                            <span className="flex items-center space-x-2">
                              <Settings className="h-4 w-4" />
                              <span>Advanced Settings</span>
                            </span>
                            {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 pt-4">
                          {renderAdvancedSettings()}
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Generate Button */}
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        disabled={generateImagesMutation.isPending}
                      >
                        {generateImagesMutation.isPending ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Creating Magic...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Wand2 className="h-5 w-5" />
                            <span>Generate Artwork</span>
                          </div>
                        )}
                      </Button>

                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Image Gallery */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Today's Gallery</span>
                </h2>
                <div className="text-sm text-muted-foreground">
                  {Array.isArray(existingImages) ? existingImages.length : 0} created today
                </div>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(existingImages) && existingImages.length > 0 ? (
                  existingImages
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((image: any, index: number) => (
                    <TradingCard
                      key={image.id}
                      image={{
                        id: image.id,
                        imageUrl: image.imageUrl,
                        prompt: image.prompt,
                        model: image.model,
                        dimensions: { width: 512, height: 512 },
                        createdAt: image.createdAt,
                        rarityTier: image.rarityTier || 'COMMON',
                        rarityScore: image.rarityScore || 50,
                        rarityStars: image.rarityStars || 1,
                        rarityLetter: image.rarityLetter || 'S',
                      }}
                      isNewest={newlyCreatedImageIds.includes(image.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Your gallery awaits
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      Start creating amazing AI artwork! Your generated images will appear here as beautiful cards that you can interact with.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      <span>Create your first masterpiece with the form on the left</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {generateImagesMutation.isPending && (
                <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <div>
                        <h3 className="text-lg font-medium text-primary">
                          Creating Your Masterpiece ✨
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Our AI is working its magic on your vision...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}