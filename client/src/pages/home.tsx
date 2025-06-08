import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Sparkles, ChevronDown, ChevronRight, Sliders, Coins, Square, Monitor, Smartphone, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import { useImageCache } from "@/hooks/useImageCache";
import EnhancedSEO from "@/components/EnhancedSEO";

interface ImageGenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  requestId: string;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("for-you");
  const [userCredits] = useState(1250);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize smart image cache
  const { cacheNewImage, getCachedOrFreshImages, cacheStats } = useImageCache();

  const form = useForm<GenerateImageRequest>({
    resolver: zodResolver(generateImageRequestSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      aspectRatio: "1:1",
      numImages: 1,
    },
  });

  // Watch form values for dynamic cost calculation
  const aspectRatio = form.watch("aspectRatio") || "1:1";
  const numImages = form.watch("numImages") || 1;
  
  // Calculate credit cost dynamically
  const baseCreditsPerImage = 1; // Base cost per image
  const aspectRatioMultiplier = aspectRatio === "16:9" || aspectRatio === "9:16" ? 1.2 : 1.0;
  const currentCost = Math.ceil(baseCreditsPerImage * aspectRatioMultiplier * numImages);

  // Use centralized auth from hook instead of separate query
  const { isAuthenticated } = useAuth();

  const { data: images = [], isLoading: imagesLoading } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images"],
    refetchInterval: isAuthenticated ? 30000 : 120000, // Slower refresh for non-auth users
    staleTime: 15000, // Consider data fresh for 15 seconds
  });

  const generateImagesMutation = useMutation<ImageGenerationResponse, Error, GenerateImageRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/generate-images", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Cache newly generated images immediately
      data.images.forEach(image => {
        cacheNewImage(image);
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      toast({
        title: "Images Generated Successfully!",
        description: `Generated ${data.images.length} image(s). Smart cache updated with ${cacheStats.totalImages + data.images.length} total images.`,
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

  const downloadImage = async (imageUrl: string, fileName?: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download Started",
        description: "Image saved to your downloads folder.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openImageModal = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleNavigationClick = (itemId: string) => {
    setActiveNavItem(itemId);
    // Here you would typically handle routing or content switching
    console.log(`Navigation clicked: ${itemId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Apple-Inspired Premium Loading Experience */}
      {generateImagesMutation.isPending ? (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900 overflow-hidden z-50">
          {/* Sophisticated background effects */}
          <div className="absolute inset-0">
            {/* Subtle particle system */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gray-300/30 dark:bg-white/10 rounded-full animate-sophisticated-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
            
            {/* Apple-style ambient light */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/20 via-purple-200/10 to-pink-200/20 dark:from-blue-500/10 dark:via-purple-500/5 dark:to-pink-500/10 rounded-full blur-3xl animate-sophisticated-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-green-200/20 via-blue-200/10 to-purple-200/20 dark:from-green-500/10 dark:via-blue-500/5 dark:to-purple-500/10 rounded-full blur-3xl animate-sophisticated-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Central content with Apple's refined aesthetic */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
            
            {/* Premium loading indicator */}
            <div className="relative mb-12">
              {/* Main spinner with Apple's signature design */}
              <div className="relative">
                {/* Outer ring */}
                <div className="w-20 h-20 border border-gray-200 dark:border-gray-700 rounded-full">
                  <div className="absolute inset-0 border-2 border-transparent border-t-gray-900 dark:border-t-white rounded-full animate-spin" style={{ animationDuration: '1.2s' }}></div>
                </div>
                
                {/* Inner content */}
                <div className="absolute inset-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full flex items-center justify-center border border-gray-100 dark:border-gray-800">
                  <Sparkles className="w-6 h-6 text-gray-700 dark:text-gray-300 animate-sophisticated-pulse" />
                </div>
              </div>
              
              {/* Elegant glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 rounded-full blur-xl animate-sophisticated-pulse" />
            </div>

            {/* Typography with Apple's refined hierarchy */}
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white tracking-tight">
                Creating Magic
              </h1>
              <p className="text-lg font-light text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
                Crafting {numImages === 1 ? 'your artwork' : `${numImages} masterpieces`} with precision and care
              </p>
            </div>

            {/* Apple-style progress indicator */}
            <div className="w-full max-w-xs space-y-6">
              {/* Refined progress bar */}
              <div className="relative">
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-shimmer bg-[length:200%_100%]" />
                </div>
              </div>
              
              {/* Status text */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-sophisticated-pulse">
                  {aspectRatio} • {numImages} {numImages === 1 ? 'image' : 'images'}
                </p>
              </div>
            </div>

            {/* Elegant details card */}
            <div className="mt-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl max-w-sm w-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Resolution</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{aspectRatio}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Quantity</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{numImages}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Credits</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{currentCost}</span>
                </div>
              </div>
            </div>

            {/* Apple-style tip */}
            <div className="absolute bottom-8 text-center">
              <p className="text-xs font-light text-gray-500 dark:text-gray-500 tracking-wide">
                Usually completes in 15–45 seconds
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Create Interface - Only shown when NOT loading */
        <main className="px-4 sm:px-6 lg:px-8 pt-4 pb-8 md:pt-8 md:pb-12 safe-area-top">
          <div className="max-w-4xl mx-auto">
            {/* Premium Generation Interface */}
            <div className="relative group">
              {/* Background gradient overlay */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl shadow-black/5 dark:shadow-black/20">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
                  {/* Enhanced Prompt Input with Apple Design */}
                  <div className="space-y-4">
                    <div className="text-center mb-6 md:mb-8">
                      <div className="flex items-center justify-center mb-4 md:mb-6">
                        <div className="flex items-center space-x-3 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-4 shadow-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                            <Coins className="h-4 w-4 text-yellow-900" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xl font-bold text-foreground">{userCredits.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground leading-none">Available Credits</span>
                          </div>
                        </div>
                      </div>



                      {/* Credit Balance Check */}
                      {userCredits < currentCost && (
                        <div className="flex items-center justify-center mb-6">
                          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-center">
                            <p className="text-sm font-medium text-destructive">
                              Insufficient credits. You need {currentCost - userCredits} more credits.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">Create with AI</h1>
                      <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">Transform your imagination into stunning visuals using advanced AI technology</p>
                    </div>
                    <label className="block text-lg font-semibold text-foreground mb-3">
                      Describe Your Vision
                    </label>
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <Textarea
                                placeholder="A serene mountain lake at sunset with golden reflections dancing on crystal-clear water..."
                                className="w-full min-h-[140px] p-6 text-base leading-relaxed bg-background/50 border-2 border-border/50 rounded-2xl resize-none transition-all duration-300 focus:border-primary/50 focus:bg-background/80 focus:shadow-lg focus:shadow-primary/10 placeholder:text-muted-foreground/60"
                                {...field}
                              />
                              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full border border-border/30">
                                  {field.value?.length || 0}/500
                                </span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Visual Aspect Ratio Selection */}
                  <div className="mb-8">
                    <FormField
                      control={form.control}
                      name="aspectRatio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-foreground mb-4 block">Choose Aspect Ratio</FormLabel>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                              { value: "1:1", label: "Square", icon: Square, description: "1:1", example: "Social posts" },
                              { value: "16:9", label: "Landscape", icon: Monitor, description: "16:9", example: "Widescreen" },
                              { value: "9:16", label: "Portrait", icon: Smartphone, description: "9:16", example: "Mobile stories" },
                              { value: "4:3", label: "Classic", icon: MoreHorizontal, description: "4:3", example: "Traditional" },
                              { value: "3:4", label: "Photo", icon: ImageIcon, description: "3:4", example: "Portrait photo" }
                            ].map((option) => {
                              const Icon = option.icon;
                              const isSelected = field.value === option.value;
                              return (
                                <div
                                  key={option.value}
                                  onClick={() => field.onChange(option.value)}
                                  className={`
                                    relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg
                                    ${isSelected 
                                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                                      : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5'
                                    }
                                  `}
                                >
                                  <div className="flex flex-col items-center space-y-3">
                                    <Icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <div className="text-center">
                                      <div className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                        {option.label}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {option.description}
                                      </div>
                                      <div className="text-xs text-muted-foreground/70 mt-1">
                                        {option.example}
                                      </div>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Image Count and Advanced Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="numImages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-foreground mb-3 block">Number of Images</FormLabel>
                          <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map((num) => {
                              const isSelected = field.value === num;
                              return (
                                <div
                                  key={num}
                                  onClick={() => field.onChange(num)}
                                  className={`
                                    cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-300 hover:scale-105
                                    ${isSelected 
                                      ? 'border-primary bg-primary/10 text-primary shadow-lg' 
                                      : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5'
                                    }
                                  `}
                                >
                                  <div className={`text-2xl font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                    {num}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {num === 1 ? 'image' : 'images'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Enhanced Advanced Options */}
                    <div>
                      <FormLabel className="text-base font-semibold text-foreground mb-3 block">Settings</FormLabel>
                      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                        <CollapsibleTrigger asChild>
                          <button type="button" className="w-full h-14 px-6 bg-background/50 border-2 border-border/50 rounded-2xl transition-all duration-300 hover:border-primary/30 focus:border-primary/50 focus:bg-background/80 flex items-center justify-between text-base font-medium">
                            <span className="flex items-center">
                              <Sliders className="h-5 w-5 mr-3 text-primary" />
                              Advanced
                            </span>
                            {showAdvanced ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                          </button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </div>
                  </div>

                  {/* Enhanced Advanced Options Panel */}
                  <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <CollapsibleContent className="mt-6 animate-slide-up">
                      <div className="p-6 bg-background/30 rounded-2xl border border-border/30">
                        <FormField
                          control={form.control}
                          name="negativePrompt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-foreground mb-3 block">Negative Prompt</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="blur, distortion, low quality, unrealistic..."
                                  className="h-14 px-6 text-base bg-background/50 border-2 border-border/50 rounded-2xl transition-all duration-300 focus:border-primary/50 focus:bg-background/80"
                                  {...field}
                                />
                              </FormControl>
                              <p className="text-sm text-muted-foreground/80 mt-2">Specify what you don't want in your image</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Premium Generate Button with Cost Display */}
                  <div className="relative pt-4">
                    <Button 
                      type="submit" 
                      disabled={generateImagesMutation.isPending || userCredits < currentCost}
                      className={`w-full h-16 text-lg font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden ${
                        userCredits < currentCost 
                          ? 'bg-gradient-to-r from-destructive/80 to-destructive/60 text-destructive-foreground shadow-destructive/25' 
                          : 'bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-primary/25'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl" />
                      <div className="relative flex items-center justify-center space-x-3">
                        <Sparkles className="h-6 w-6" />
                        <div className="flex flex-col items-center">
                          <span>
                            {generateImagesMutation.isPending 
                              ? "Creating Magic..." 
                              : userCredits < currentCost 
                                ? "Insufficient Credits" 
                                : "Generate Images"
                            }
                          </span>
                          {!generateImagesMutation.isPending && userCredits >= currentCost && (
                            <span className="text-sm opacity-90">
                              Use {currentCost} credits
                            </span>
                          )}
                        </div>
                      </div>
                    </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Premium Gallery Section - Only show when not loading and has non-cosplay images */}
      {!generateImagesMutation.isPending && images.filter(image => image.modelId !== "fal-ai/flux-pro/kontext").length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mb-12 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Your Recent Creations</h2>
              <p className="text-lg text-muted-foreground">Masterpieces created with AI magic</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {images.filter(image => image.modelId !== "fal-ai/flux-pro/kontext").slice(0, 8).map((image) => (
                <div key={image.id} className="group relative">
                  {/* Card with enhanced Apple styling */}
                  <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/30">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={image.imageUrl} 
                        alt={image.prompt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                        onClick={() => openImageModal(image)}
                      />
                    </div>
                    
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm line-clamp-2 mb-3 font-medium">{image.prompt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-xs">{formatTimeAgo(new Date(image.createdAt))}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(image.imageUrl, image.fileName || undefined);
                          }}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        >
                          <Download className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced iOS Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-2 border-border/50 rounded-3xl shadow-2xl">
          {selectedImage && (
            <>
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.prompt}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-foreground mb-4 leading-tight">
                    {selectedImage.prompt}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{formatTimeAgo(new Date(selectedImage.createdAt))}</p>
                    <p className="text-xs">Aspect ratio: {selectedImage.aspectRatio}</p>
                  </div>
                  <Button 
                    onClick={() => downloadImage(selectedImage.imageUrl, selectedImage.fileName || undefined)}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}