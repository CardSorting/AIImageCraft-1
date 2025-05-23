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
import { Sparkles, ChevronDown, ChevronRight, Sliders, Palette, Camera, Wand2 } from "lucide-react";

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
  const [progressStage, setProgressStage] = useState(0);
  const [progressText, setProgressText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GenerateImageRequest>({
    resolver: zodResolver(generateImageRequestSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      aspectRatio: "1:1",
      numImages: 1,
    },
  });

  // Dynamic progress simulation for better UX
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (generateImagesMutation.isPending) {
      setProgressStage(0);
      setProgressText("Analyzing your prompt...");
      
      progressInterval = setInterval(() => {
        setProgressStage(prev => {
          const next = prev + 1;
          switch (next) {
            case 1:
              setProgressText("AI is processing your vision...");
              break;
            case 2:
              setProgressText("Generating high-quality pixels...");
              break;
            case 3:
              setProgressText("Adding final details...");
              break;
            case 4:
              setProgressText("Storing to your cloud storage...");
              break;
            default:
              setProgressText("Almost ready...");
          }
          return next > 4 ? 0 : next;
        });
      }, 8000); // Update every 8 seconds
    } else {
      setProgressStage(0);
      setProgressText("");
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [generateImagesMutation.isPending]);

  const generateImagesMutation = useMutation<ImageGenerationResponse, Error, GenerateImageRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/generate-images", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      toast({
        title: "Images Generated Successfully!",
        description: `Generated ${data.images.length} image(s). Check your gallery to see them.`,
      });
      form.reset({
        prompt: "",
        negativePrompt: "",
        aspectRatio: "1:1",
        numImages: 1,
      });
    },
    onError: (error: any) => {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again with a different prompt.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateImageRequest) => {
    generateImagesMutation.mutate(data);
  };

  const useQuickPrompt = (prompt: string) => {
    form.setValue("prompt", prompt);
  };

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

      {/* Generation Form */}
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

            {/* Enhanced Generate Button */}
            <Button 
              type="submit" 
              disabled={generateImagesMutation.isPending}
              className="btn-ios-primary w-full h-14 text-lg font-semibold haptic-medium relative overflow-hidden group"
            >
              {generateImagesMutation.isPending ? (
                <>
                  {/* Loading Animation */}
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <Sparkles className="absolute inset-0 w-6 h-6 text-white/70 animate-pulse" />
                    </div>
                    <span className="animate-pulse">Creating Magic...</span>
                  </div>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6 mr-3 group-hover:animate-spin transition-transform duration-300" />
                  <span>Generate Images</span>
                  {/* Hover Shimmer */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Enhanced Loading State */}
      {generateImagesMutation.isPending && (
        <div className="card-ios-elevated p-8 text-center animate-fade-in">
          {/* Main Loading Animation */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            {/* Outer Ring */}
            <div className="absolute inset-0 w-24 h-24 border-4 border-primary/20 rounded-full"></div>
            {/* Animated Ring */}
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            {/* Inner Glow */}
            <div className="absolute inset-2 w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full animate-pulse"></div>
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>

          {/* Dynamic Status Text */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Creating Your Masterpiece</h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground animate-pulse min-h-[20px]">
                {progressText || "AI is crafting your image with incredible detail..."}
              </p>
              
              {/* Dynamic Progress Steps */}
              <div className="flex items-center justify-center space-x-3 text-xs text-muted-foreground">
                <div className={`flex items-center space-x-1 transition-all duration-500 ${progressStage >= 0 ? 'text-primary' : ''}`}>
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${progressStage >= 0 ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`}></div>
                  <span>Analyzing</span>
                </div>
                <div className="w-1 h-1 bg-border rounded-full"></div>
                <div className={`flex items-center space-x-1 transition-all duration-500 ${progressStage >= 2 ? 'text-primary' : ''}`}>
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${progressStage >= 2 ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`}></div>
                  <span>Generating</span>
                </div>
                <div className="w-1 h-1 bg-border rounded-full"></div>
                <div className={`flex items-center space-x-1 transition-all duration-500 ${progressStage >= 4 ? 'text-primary' : ''}`}>
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${progressStage >= 4 ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`}></div>
                  <span>Storing</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-sm mx-auto">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((progressStage + 1) * 20, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="mt-6 p-4 bg-muted/50 rounded-2xl border border-border/50">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
              <span>Estimated time: 30-60 seconds</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}