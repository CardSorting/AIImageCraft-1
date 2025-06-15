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
  const [showSettings, setShowSettings] = useState(false);
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

  // Render
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="AI Art Generator - Create Stunning Digital Artwork"
        description="Generate beautiful AI artwork with professional models. Create, customize, and download your digital masterpieces."
      />
      <NavigationHeader />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>AI Art Generator</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Prompt Input */}
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe Your Vision</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A serene mountain lake at sunset with golden reflections, photorealistic, 8k..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Aspect Ratio */}
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
                          <SelectItem value="1:1">Square (1:1)</SelectItem>
                          <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                          <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                          <SelectItem value="4:3">Classic (4:3)</SelectItem>
                          <SelectItem value="3:4">Tall (3:4)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={generateImagesMutation.isPending}
                  className="w-full"
                >
                  {generateImagesMutation.isPending ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Gallery */}
        {existingImages.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Recent Creations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.map((image: any) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {newlyCreatedImageIds.includes(image.id) && (
                      <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}