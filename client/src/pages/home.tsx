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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-xl flex items-center justify-center">
                <Sparkles className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[hsl(var(--near-black))]">AI Image Generator</h1>
                <p className="text-sm text-gray-500">Powered by Google Imagen 4</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold text-[hsl(var(--near-black))] mb-4">Create stunning AI images</h2>
            <p className="text-gray-600 mb-8">Describe your vision and watch it come to life with Google's Imagen 4 model</p>
            
            {/* Generation Form */}
            <div className="relative">
              <div className="bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/20 p-1 rounded-2xl">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Prompt Input */}
                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Textarea
                                  placeholder="Describe the image you want to create... (e.g., A majestic lion in a sunlit savanna with golden grass)"
                                  className="min-h-[120px] resize-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] transition-colors"
                                  {...field}
                                />
                                <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                                  {field.value?.length || 0}/500
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Generation Options */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <FormField
                            control={form.control}
                            name="aspectRatio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm text-gray-600">Aspect Ratio:</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-[140px]">
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
                                <FormLabel className="text-sm text-gray-600">Images:</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                                  <FormControl>
                                    <SelectTrigger className="w-[80px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" type="button">
                                <Sliders className="h-4 w-4 mr-2" />
                                Advanced
                                {showAdvanced ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
                              </Button>
                            </CollapsibleTrigger>
                            
                            {/* Advanced Options */}
                            <CollapsibleContent className="space-y-4 mt-4">
                              <FormField
                                control={form.control}
                                name="negativePrompt"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Negative Prompt (Optional)</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="What you don't want to see in the image..."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={generateImagesMutation.isPending}
                          className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>{generateImagesMutation.isPending ? "Generating..." : "Generate Images"}</span>
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {generateImagesMutation.isPending && (
          <section className="mb-12">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full mb-4">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-medium text-[hsl(var(--near-black))] mb-2">Generating your images...</h3>
              <p className="text-gray-600 mb-6">This may take a few moments</p>
              
              <div className="max-w-md mx-auto">
                <Progress value={65} className="h-2" />
                <p className="text-sm text-gray-500 mt-2">Processing your request...</p>
              </div>
            </div>
          </section>
        )}

        {/* Image Gallery */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-[hsl(var(--near-black))]">Recent Generations</h3>
            <div className="flex items-center space-x-3">
              <span className="text-gray-500 text-sm">{images.length} images</span>
            </div>
          </div>

          {images.length === 0 && !imagesLoading ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-[hsl(var(--primary))]/20 to-[hsl(var(--accent))]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="text-[hsl(var(--primary))] text-2xl" />
                </div>
                <h3 className="text-xl font-medium text-[hsl(var(--near-black))] mb-3">No images generated yet</h3>
                <p className="text-gray-600 mb-6">Start by describing the image you want to create in the prompt above.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <Card key={image.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="relative">
                    <img 
                      src={image.imageUrl} 
                      alt={image.prompt}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-sm mb-3 line-clamp-2">{image.prompt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-xs">{formatTimeAgo(new Date(image.createdAt))}</span>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-white/20 backdrop-blur-sm text-white p-2 h-8 w-8 hover:bg-white/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(image.imageUrl, image.fileName || undefined);
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-white/20 backdrop-blur-sm text-white p-2 h-8 w-8 hover:bg-white/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                openImageModal(image);
                              }}
                            >
                              <Expand className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{image.prompt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{formatTimeAgo(new Date(image.createdAt))}</span>
                      <span className="text-xs bg-[hsl(var(--accent))] text-[hsl(var(--primary))] px-2 py-1 rounded-full">{image.aspectRatio}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Generated Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img 
                src={selectedImage.imageUrl}
                alt={selectedImage.prompt}
                className="w-full h-auto max-h-96 object-contain rounded-lg"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 flex-1 mr-4">{selectedImage.prompt}</p>
                <Button
                  onClick={() => downloadImage(selectedImage.imageUrl, selectedImage.fileName || undefined)}
                  className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
