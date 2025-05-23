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
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Expand, History, Settings, Sparkles, ChevronDown, ChevronRight, Sliders } from "lucide-react";

interface ImageGenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  requestId: string;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Native iOS-style Header */}
      <header className="glass-effect sticky top-0 z-50 safe-area-top">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-md haptic-light">
                <Sparkles className="text-primary-foreground w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground tracking-tight">AI Studio</h1>
                <p className="text-xs text-muted-foreground">Imagen 4 • Google</p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-lg font-semibold text-foreground tracking-tight">AI Studio</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn-ios-ghost w-10 h-10 haptic-light">
                <History className="h-5 w-5" />
              </button>
              <button className="btn-ios-ghost w-10 h-10 haptic-light">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-responsive py-6 safe-area-bottom">
        {/* Hero Section */}
        <section className="text-center mb-8 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight text-balance">Create Amazing AI Images</h2>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed text-balance">Transform your ideas into stunning visuals with Google's advanced Imagen 4 model</p>
            
            {/* Generation Form - Native iOS Card */}
            <div className="card-ios-elevated p-6 space-y-6 animate-scale-in">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="touch-spacing">
                  {/* Prompt Input - Native Style */}
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              placeholder="Describe your vision... (e.g., A serene mountain lake at sunset with golden reflections)"
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

                  {/* Native iOS Options Panel */}
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

                    {/* Advanced Options Toggle */}
                    <div className="sm:col-span-1">
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

                  {/* Advanced Options Panel */}
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
                                placeholder="What you don't want to see..."
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

                  {/* Native iOS Generate Button */}
                  <Button 
                    type="submit" 
                    disabled={generateImagesMutation.isPending}
                    className="btn-ios-primary w-full h-12 text-lg font-semibold haptic-medium"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {generateImagesMutation.isPending ? "Creating..." : "Generate Images"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </section>

        {/* Loading State - Native iOS Style */}
        {generateImagesMutation.isPending && (
          <section className="mb-8 animate-fade-in">
            <div className="card-ios-elevated p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="text-primary-foreground w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Creating Your Images</h3>
              <p className="text-muted-foreground mb-4">Our AI is working its magic...</p>
              <Progress value={undefined} className="w-full max-w-xs mx-auto" />
            </div>
          </section>
        )}

        {/* Gallery - Native iOS Style */}
        {images.length > 0 && (
          <section className="animate-fade-in">
            <div className="section-header-ios mb-4">
              <h3>Recent Creations</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="card-ios group hover:scale-[1.02] transition-transform duration-200">
                  <div className="aspect-square overflow-hidden rounded-t-2xl">
                    <img 
                      src={image.imageUrl} 
                      alt={image.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => openImageModal(image)}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-foreground line-clamp-2 mb-2">{image.prompt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatTimeAgo(new Date(image.createdAt))}</span>
                      <button 
                        onClick={() => downloadImage(image.imageUrl, image.fileName || undefined)}
                        className="btn-ios-ghost p-2 haptic-light"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Native iOS Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="card-ios-elevated max-w-4xl p-0 overflow-hidden">
          {selectedImage && (
            <>
              <div className="aspect-video overflow-hidden">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.prompt}
                  className="w-full h-full object-contain bg-muted"
                />
              </div>
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-foreground mb-2">
                    {selectedImage.prompt}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    {formatTimeAgo(new Date(selectedImage.createdAt))}
                  </span>
                  <Button 
                    onClick={() => downloadImage(selectedImage.imageUrl, selectedImage.fileName || undefined)}
                    className="btn-ios-primary haptic-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
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