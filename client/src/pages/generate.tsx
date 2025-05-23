import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Sparkles, ChevronDown, ChevronRight, Sliders, Palette, Camera, Wand2, 
  Brain, Zap, Star, Plus, X, Settings, Lightbulb, ImageIcon, 
  Shuffle, Copy, Download, Share, Eye, Menu, ArrowLeft, Grid, List
} from "lucide-react";
import { TradingCard } from "@/components/TradingCard";
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
  const [selectedLoras, setSelectedLoras] = useState<Array<{model: string; weight: number}>>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [galleryView, setGalleryView] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const form = useForm<GenerateImageRequest>({
    resolver: zodResolver(generateImageRequestSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      aspectRatio: "1:1",
      model: "runware:100@1",
      steps: 30,
      cfgScale: 7,
    },
  });

  // Fetch existing images
  const { data: existingImages = [], refetch } = useQuery({
    queryKey: ["/api/images"],
    queryFn: () => fetch("/api/images").then(res => res.json()),
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
        description: "Your masterpiece has been added to the gallery",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      refetch();
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

  const renderMobileCreateForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        {/* Quick Prompt Suggestions - Mobile Grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            "Majestic dragon",
            "Cyberpunk city", 
            "Fantasy castle",
            "Space station"
          ].map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addQuickPrompt(suggestion)}
              className="text-xs h-8"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Essential Settings - Mobile */}
        <div className="grid grid-cols-2 gap-3">
          {/* Aspect Ratio */}
          <FormField
            control={form.control}
            name="aspectRatio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Aspect Ratio</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square</SelectItem>
                      <SelectItem value="4:3">Landscape</SelectItem>
                      <SelectItem value="16:9">Widescreen</SelectItem>
                      <SelectItem value="3:4">Portrait</SelectItem>
                      <SelectItem value="9:16">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Model Selection */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">AI Model</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="runware:100@1">Runware v1</SelectItem>
                      <SelectItem value="runware:101@1">Runware v1.1</SelectItem>
                      <SelectItem value="runware:4@1">Runware v4</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Generate Button - Mobile */}
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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
        <h2 className="text-lg font-semibold flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>Your Gallery</span>
        </h2>
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

      {/* Images Grid - Mobile Optimized */}
      {Array.isArray(existingImages) && existingImages.length > 0 ? (
        <div className={
          galleryView === "grid" 
            ? "grid grid-cols-2 gap-3" 
            : "space-y-3"
        }>
          {existingImages
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
              isNewest={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            Your gallery awaits
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm text-sm">
            Start creating amazing AI artwork! Your generated images will appear here as beautiful trading cards.
          </p>
          <Button
            variant="outline"
            onClick={() => setActiveTab("create")}
            className="text-sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create your first masterpiece
          </Button>
        </div>
      )}
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6 pb-6">
      {/* Steps */}
      <FormField
        control={form.control}
        name="steps"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Steps: {field.value}</FormLabel>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
                max={50}
                min={10}
                step={5}
                className="w-full"
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">Higher values = better quality, longer generation time</p>
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
            <FormLabel className="text-base font-medium">Guidance Scale: {field.value}</FormLabel>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
                max={20}
                min={1}
                step={0.5}
                className="w-full"
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">How closely AI follows your prompt</p>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Number of Images */}
      <FormField
        control={form.control}
        name="numImages"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Number of Images: {field.value || 1}</FormLabel>
            <FormControl>
              <Slider
                value={[field.value || 1]}
                onValueChange={(value) => field.onChange(value[0])}
                max={4}
                min={1}
                step={1}
                className="w-full"
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
            <FormLabel className="text-base font-medium">Scheduler</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scheduler..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DPMSolverMultistepScheduler">DPM++ 2M (Recommended)</SelectItem>
                  <SelectItem value="EulerDiscreteScheduler">Euler (Fast)</SelectItem>
                  <SelectItem value="EulerAncestralDiscreteScheduler">Euler Ancestral</SelectItem>
                  <SelectItem value="DDIMScheduler">DDIM (Classic)</SelectItem>
                  <SelectItem value="LMSDiscreteScheduler">LMS (Balanced)</SelectItem>
                  <SelectItem value="UniPCMultistepScheduler">UniPC (Quality)</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Seed */}
      <FormField
        control={form.control}
        name="seed"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Seed (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Random seed for reproducibility..."
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">Leave empty for random results</p>
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
            <FormLabel className="text-base font-medium">Negative Prompt</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Things to avoid in the image..."
                className="min-h-[80px] resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* LoRA Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base font-medium flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Style Enhancers (LoRA)</span>
          </FormLabel>
          <Badge variant="secondary" className="text-xs">
            {selectedLoras.length} active
          </Badge>
        </div>
        
        {selectedLoras.length > 0 && (
          <div className="space-y-3">
            {selectedLoras.map((lora, index) => (
              <div key={index} className="flex items-center justify-between bg-muted rounded-lg p-3">
                <div className="flex-1">
                  <span className="text-sm font-medium">{lora.model}</span>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-muted-foreground">Weight:</span>
                    <Slider
                      value={[lora.weight]}
                      onValueChange={(value) => {
                        const newLoras = [...selectedLoras];
                        newLoras[index].weight = value[0];
                        setSelectedLoras(newLoras);
                      }}
                      max={2}
                      min={0.1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8">{lora.weight}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedLoras(selectedLoras.filter((_, i) => i !== index));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedLoras([...selectedLoras, { model: "cartoon-style", weight: 1.0 }]);
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Style Enhancer
        </Button>
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
              <h1 className="font-semibold text-lg">AI Studio</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {Array.isArray(existingImages) ? existingImages.length : 0}
              </Badge>
              <Sheet open={showSettings} onOpenChange={setShowSettings}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Advanced Settings</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Advanced Settings</SheetTitle>
                    <SheetDescription>
                      Fine-tune your AI generation parameters
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-full mt-4">
                    {renderAdvancedSettings()}
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100vh-60px)]">
          <div className="border-b bg-background/95 backdrop-blur">
            <TabsList className="grid w-full grid-cols-2 h-12 mx-4 my-2">
              <TabsTrigger value="create" className="text-sm">
                <Wand2 className="h-4 w-4 mr-2" />
                Create
              </TabsTrigger>
              <TabsTrigger value="gallery" className="text-sm">
                <ImageIcon className="h-4 w-4 mr-2" />
                Gallery
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="create" className="flex-1 p-4 space-y-4 overflow-auto">
            {renderMobileCreateForm()}
          </TabsContent>

          <TabsContent value="gallery" className="flex-1 p-4 overflow-auto">
            {renderMobileGallery()}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Image Studio
              </h1>
              <p className="text-sm text-muted-foreground">
                Professional AI artwork creation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                {Array.isArray(existingImages) ? existingImages.length : 0} Images Created
              </Badge>
            </div>
          </div>
        </div>
      </div>

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
                                className="min-h-[100px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Quick Prompt Suggestions */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Majestic dragon",
                          "Cyberpunk city",
                          "Fantasy castle",
                          "Space station"
                        ].map((suggestion) => (
                          <Button
                            key={suggestion}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addQuickPrompt(suggestion)}
                            className="text-xs"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>

                      {/* Aspect Ratio */}
                      <FormField
                        control={form.control}
                        name="aspectRatio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aspect Ratio</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                                  <SelectItem value="4:3">Landscape (4:3)</SelectItem>
                                  <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                                  <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                                  <SelectItem value="9:16">Mobile (9:16)</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Model Selection */}
                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Brain className="h-4 w-4" />
                              <span>AI Model</span>
                            </FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="runware:100@1">Runware v1 (Recommended)</SelectItem>
                                  <SelectItem value="runware:101@1">Runware v1.1 (Enhanced)</SelectItem>
                                  <SelectItem value="runware:4@1">Runware v4 (Ultra)</SelectItem>
                                </SelectContent>
                              </Select>
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
                  <span>Your Gallery</span>
                </h2>
                <div className="text-sm text-muted-foreground">
                  {Array.isArray(existingImages) ? existingImages.length : 0} masterpieces created
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
                      isNewest={index === 0}
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