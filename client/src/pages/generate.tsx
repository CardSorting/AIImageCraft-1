import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateImageRequestSchema, type GenerateImageRequest, type GeneratedImage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, ChevronDown, ChevronRight, Sliders, Palette, Camera, Wand2, Zap, Stars, Loader2 } from "lucide-react";

interface ImageGenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  requestId: string;
}

const quickPrompts = [
  "A serene mountain lake at sunset with golden reflections",
  "A futuristic city skyline with flying cars and neon lights",
  "A cozy coffee shop on a rainy day with warm lighting",
  "A magical forest with glowing mushrooms and fairy lights",
  "A minimalist modern living room with natural lighting",
  "A vintage car on a scenic coastal highway",
];

export default function Generate() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dynamic loading messages with Apple-style progression
  const loadingMessages = [
    { message: "Analyzing your creative vision...", icon: Palette },
    { message: "Initializing AI neural networks...", icon: Zap },
    { message: "Generating artistic elements...", icon: Sparkles },
    { message: "Refining visual details...", icon: Stars },
    { message: "Applying final touches...", icon: Wand2 },
    { message: "Creating your masterpiece...", icon: Camera },
  ];

  const form = useForm<GenerateImageRequest>({
    resolver: zodResolver(generateImageRequestSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      aspectRatio: "1:1",
      numImages: 1,
    },
  });

  const generateImagesMutation = useMutation<ImageGenerationResponse, Error, GenerateImageRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/generate-images", data);
      return response.json();
    },
    onSuccess: (data) => {
      setLoadingProgress(100);
      setLoadingMessage("Masterpiece complete! ✨");
      
      // Brief completion animation before cleanup
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/images"] });
        toast({
          title: "🎨 Images Generated Successfully!",
          description: `Created ${data.images.length} stunning image${data.images.length > 1 ? 's' : ''}! Check your gallery to view them.`,
        });
        form.reset({
          prompt: "",
          negativePrompt: "",
          aspectRatio: "1:1",
          numImages: 1,
        });
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Generation error:", error);
      setLoadingProgress(0);
      setLoadingMessage("");
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again with a different prompt.",
        variant: "destructive",
      });
    },
  });

  // Enhanced loading progression with Apple-style timing
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let messageInterval: NodeJS.Timeout;
    
    if (generateImagesMutation.isPending) {
      setLoadingProgress(0);
      setLoadingMessage(loadingMessages[0].message);
      
      // Smooth progress animation
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 3 + 1;
        });
      }, 200);
      
      // Dynamic message progression
      messageInterval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.findIndex(msg => msg.message === prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex].message;
        });
      }, 3000);
    } else {
      setLoadingProgress(0);
      setLoadingMessage("");
    }
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [generateImagesMutation.isPending, loadingMessages]);

  const onSubmit = (data: GenerateImageRequest) => {
    generateImagesMutation.mutate(data);
  };

  const useQuickPrompt = (prompt: string) => {
    form.setValue("prompt", prompt);
  };

  // Get current loading message icon
  const currentMessageData = loadingMessages.find(msg => msg.message === loadingMessage) || loadingMessages[0];
  const CurrentIcon = currentMessageData.icon;

  return (
    <div className="container-responsive py-6">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Wand2 className="text-primary-foreground w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Studio</h1>
        <p className="text-muted-foreground text-lg">Create stunning images with advanced AI</p>
      </header>

      {/* Apple-style Dynamic Loading Experience */}
      {generateImagesMutation.isPending ? (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center animate-in fade-in duration-700">
          <div className="text-center max-w-md mx-auto px-6">
            {/* Main Loading Animation */}
            <div className="relative mb-12">
              {/* Outer rotating ring */}
              <div className="w-32 h-32 rounded-full border-4 border-primary/20 animate-spin mx-auto mb-8 relative">
                <div className="absolute top-0 left-1/2 w-4 h-4 bg-primary rounded-full -translate-x-1/2 -translate-y-2"></div>
              </div>
              
              {/* Central icon with pulsing animation */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                  <CurrentIcon className="text-primary-foreground w-10 h-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/10 rounded-2xl"></div>
                </div>
              </div>
              
              {/* Floating particles animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-primary/40 rounded-full animate-ping"
                    style={{
                      left: `${20 + (i * 12)}%`,
                      top: `${30 + Math.sin(i) * 20}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Dynamic Progress Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 animate-pulse">
                  Creating Your Masterpiece
                </h3>
                <p className="text-lg text-primary font-medium transition-all duration-500 ease-in-out">
                  {loadingMessage}
                </p>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="space-y-3">
                <div className="relative">
                  <Progress 
                    value={loadingProgress} 
                    className="w-full h-3 bg-muted/50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent h-3 rounded-full animate-shimmer"></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">{Math.round(loadingProgress)}%</span>
                </div>
              </div>

              {/* Time estimation */}
              <p className="text-sm text-muted-foreground">
                ✨ This usually takes 30-60 seconds • Crafted with AI precision
              </p>

              {/* Subtle hint about the process */}
              <div className="mt-8 p-4 bg-card/50 rounded-2xl border border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our AI is analyzing millions of artistic patterns to bring your vision to life with stunning detail and creativity.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Generation Form - Hidden during loading */
        <div className="animate-in fade-in duration-500">
          <div className="card-ios-elevated p-6 mb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Main Prompt */}
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground flex items-center">
                        <Palette className="h-5 w-5 mr-2" />
                        Describe Your Vision
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="A magical sunset over a crystal clear lake with mountains in the background..."
                            className="input-ios min-h-[120px] resize-none text-base leading-relaxed"
                            {...field}
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-card px-2 py-1 rounded-lg border border-border/50">
                            {field.value?.length || 0}/500
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quick Prompts */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Ideas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => useQuickPrompt(prompt)}
                        className="text-left p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm text-foreground line-clamp-2 haptic-light"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generation Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="aspectRatio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-muted-foreground">Aspect Ratio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="input-ios">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1:1">1:1 Square</SelectItem>
                            <SelectItem value="16:9">16:9 Landscape</SelectItem>
                            <SelectItem value="9:16">9:16 Portrait</SelectItem>
                            <SelectItem value="4:3">4:3 Standard</SelectItem>
                            <SelectItem value="3:4">3:4 Portrait</SelectItem>
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
                        <FormLabel className="text-sm font-medium text-muted-foreground">Count</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                          <FormControl>
                            <SelectTrigger className="input-ios">
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

                  <div>
                    <FormLabel className="text-sm font-medium text-muted-foreground">Options</FormLabel>
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <button type="button" className="btn-ios-secondary w-full justify-between haptic-light">
                          <span className="flex items-center">
                            <Sliders className="h-4 w-4 mr-2" />
                            Advanced
                          </span>
                          {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  </div>
                </div>

                {/* Advanced Options */}
                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <CollapsibleContent className="animate-slide-up">
                    <FormField
                      control={form.control}
                      name="negativePrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-muted-foreground">Negative Prompt (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="blur, distortion, low quality..."
                              className="input-ios"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </Collapsible>

                {/* Generate Button */}
                <Button 
                  type="submit" 
                  disabled={generateImagesMutation.isPending}
                  className="btn-ios-primary w-full h-14 text-lg font-semibold haptic-medium"
                >
                  <Sparkles className="h-6 w-6 mr-3" />
                  Generate Images
                </Button>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}