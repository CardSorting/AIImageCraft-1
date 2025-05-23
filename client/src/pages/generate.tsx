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
import { 
  Sparkles, ChevronDown, ChevronRight, Sliders, Palette, Camera, Wand2, 
  Brain, Zap, Star, Plus, X, Settings, Lightbulb, ImageIcon, 
  Shuffle, Copy, Download, Share, Eye
} from "lucide-react";
import { ImageCard } from "@/components/ImageCard";
import { generateImageRequestSchema, type GenerateImageRequest } from "@shared/schema";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ImageGenerationResponse {
  success: boolean;
  images: any[];
  requestId: string;
}

export default function Generate() {
  const [activeTab, setActiveTab] = useState("basic");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedLoras, setSelectedLoras] = useState<Array<{model: string; weight: number}>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Image Studio
              </h1>
              <p className="text-sm text-muted-foreground">
                Professional AI artwork creation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {Array.isArray(existingImages) ? existingImages.length : 0} Images Created
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-120px)]">
          
          {/* Left Sidebar - Generation Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Sparkles className="h-5 w-5 text-blue-600" />
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
                          
                          {/* Steps */}
                          <FormField
                            control={form.control}
                            name="steps"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Steps: {field.value}</FormLabel>
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
                                <FormLabel>Guidance Scale: {field.value}</FormLabel>
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
                                <FormLabel>Number of Images: {field.value || 1}</FormLabel>
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
                                <FormLabel className="flex items-center space-x-2">
                                  <Zap className="h-4 w-4" />
                                  <span>Scheduler</span>
                                </FormLabel>
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
                                <FormLabel className="flex items-center space-x-2">
                                  <Shuffle className="h-4 w-4" />
                                  <span>Seed (Optional)</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Random seed for reproducibility..."
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  />
                                </FormControl>
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
                                <FormLabel>Negative Prompt</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Things to avoid in the image..."
                                    className="min-h-[60px] resize-none"
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
                              <FormLabel className="flex items-center space-x-2">
                                <Palette className="h-4 w-4" />
                                <span>Style Enhancers (LoRA)</span>
                              </FormLabel>
                              <Badge variant="secondary" className="text-xs">
                                {selectedLoras.length} active
                              </Badge>
                            </div>
                            
                            {selectedLoras.length > 0 && (
                              <div className="space-y-2">
                                {selectedLoras.map((lora, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                    <div className="flex-1">
                                      <span className="text-sm font-medium">{lora.model}</span>
                                      <div className="flex items-center space-x-2 mt-1">
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

                        </CollapsibleContent>
                      </Collapsible>

                      {/* Generate Button */}
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                    <ImageCard
                      key={image.id}
                      image={{
                        id: image.id,
                        imageUrl: image.imageUrl,
                        prompt: image.prompt,
                        model: image.model,
                        dimensions: { width: 512, height: 512 },
                        createdAt: image.createdAt
                      }}
                      isNewest={index === 0}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Your gallery awaits
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
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
                <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50 dark:bg-blue-950/20">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <div>
                        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                          Creating Your Masterpiece ✨
                        </h3>
                        <p className="text-blue-700 dark:text-blue-300 mt-1">
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