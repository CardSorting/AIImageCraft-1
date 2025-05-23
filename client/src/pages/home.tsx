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
import { Download, Sparkles, ChevronDown, ChevronRight, Sliders, Coins } from "lucide-react";

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
  
  // Calculate credit cost dynamically - $0.15 per image
  const dollarCostPerImage = 0.15; // $0.15 per image
  const creditsPerDollar = 100; // 100 credits = $1.00
  const baseCreditsPerImage = Math.ceil(dollarCostPerImage * creditsPerDollar); // 15 credits per image
  const aspectRatioMultiplier = aspectRatio === "16:9" || aspectRatio === "9:16" ? 1.2 : 1.0;
  const currentCost = Math.ceil(baseCreditsPerImage * aspectRatioMultiplier * numImages);
  const dollarCost = (currentCost / creditsPerDollar).toFixed(2);

  const { data: images = [], isLoading: imagesLoading } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images"],
  });

  const generateImagesMutation = useMutation<ImageGenerationResponse, Error, GenerateImageRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/generate-images", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      toast({
        title: "Images Generated Successfully!",
        description: `Generated ${data.images.length} image(s). They're ready for download.`,
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
    <div className="min-h-screen bg-background">

      {/* Clean Create Interface */}
      <main className="px-4 sm:px-6 lg:px-8 pt-8 pb-12 safe-area-top">
        <div className="max-w-4xl mx-auto">
          {/* Premium Generation Interface */}
          <div className="relative group">
            {/* Background gradient overlay */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/20">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Enhanced Prompt Input with Apple Design */}
                  <div className="space-y-4">
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center mb-6">
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

                      {/* Dynamic Cost Display */}
                      <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center space-x-3 bg-primary/10 border border-primary/20 rounded-xl px-6 py-4">
                          <div className="text-center">
                            <span className="text-sm font-medium text-foreground block mb-1">Generation Cost</span>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Coins className="h-4 w-4 text-primary" />
                                <span className="text-lg font-bold text-primary">{currentCost}</span>
                                <span className="text-sm text-muted-foreground">credits</span>
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-lg font-bold text-green-600">${dollarCost}</span>
                            </div>
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
                      
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">Create with AI</h1>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">Transform your imagination into stunning visuals using advanced AI technology</p>
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

                  {/* Premium Control Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="aspectRatio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-foreground mb-3 block">Aspect Ratio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 px-6 text-base bg-background/50 border-2 border-border/50 rounded-2xl transition-all duration-300 hover:border-primary/30 focus:border-primary/50 focus:bg-background/80">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-2 bg-background/95 backdrop-blur-xl">
                              <SelectItem value="1:1" className="h-12 px-4 rounded-xl">1:1 Square</SelectItem>
                              <SelectItem value="16:9" className="h-12 px-4 rounded-xl">16:9 Landscape</SelectItem>
                              <SelectItem value="9:16" className="h-12 px-4 rounded-xl">9:16 Portrait</SelectItem>
                              <SelectItem value="4:3" className="h-12 px-4 rounded-xl">4:3 Standard</SelectItem>
                              <SelectItem value="3:4" className="h-12 px-4 rounded-xl">3:4 Portrait</SelectItem>
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
                          <FormLabel className="text-base font-semibold text-foreground mb-3 block">Image Count</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                            <FormControl>
                              <SelectTrigger className="h-14 px-6 text-base bg-background/50 border-2 border-border/50 rounded-2xl transition-all duration-300 hover:border-primary/30 focus:border-primary/50 focus:bg-background/80">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-2 bg-background/95 backdrop-blur-xl">
                              <SelectItem value="1" className="h-12 px-4 rounded-xl">1 Image</SelectItem>
                              <SelectItem value="2" className="h-12 px-4 rounded-xl">2 Images</SelectItem>
                              <SelectItem value="3" className="h-12 px-4 rounded-xl">3 Images</SelectItem>
                              <SelectItem value="4" className="h-12 px-4 rounded-xl">4 Images</SelectItem>
                            </SelectContent>
                          </Select>
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
                              Use {currentCost} credits (${dollarCost})
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

      {/* Apple-style Loading Experience */}
      {generateImagesMutation.isPending && (
        <div className="px-4 sm:px-6 lg:px-8 mb-12 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-12 text-center shadow-2xl">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl animate-pulse" />
              
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative overflow-hidden">
                  <Sparkles className="text-primary-foreground w-12 h-12 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/10 rounded-full" />
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Creating Your Masterpiece</h3>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">Our AI is painting your vision into reality...</p>
                
                <div className="space-y-4">
                  <Progress value={undefined} className="w-full h-3 rounded-full" />
                  <p className="text-sm text-muted-foreground/80">This usually takes 30-60 seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Gallery Section */}
      {images.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mb-12 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Your Recent Creations</h2>
              <p className="text-lg text-muted-foreground">Masterpieces created with AI magic</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.slice(0, 8).map((image) => (
                <div key={image.id} className="group relative">
                  {/* Card with enhanced Apple styling */}
                  <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/30">
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