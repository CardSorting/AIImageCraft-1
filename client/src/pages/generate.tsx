import { useState } from "react";
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
import { ModelSelector } from "@/components/ModelSelector";
import { LoRASelector } from "@/components/LoRASelector";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GenerateImageRequest>({
    resolver: zodResolver(generateImageRequestSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      aspectRatio: "1:1",
      numImages: 1,
      model: "runware:100@1",
      loras: [],
      steps: 20,
      cfgScale: 7,
    },
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

            {/* Model Selection */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <ModelSelector value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* LoRA Selection */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border">
              <FormField
                control={form.control}
                name="loras"
                render={({ field }) => (
                  <FormItem>
                    <LoRASelector value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Advanced Options */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between h-12 text-sm font-medium"
                >
                  <div className="flex items-center space-x-2">
                    <Sliders className="h-4 w-4" />
                    <span>Advanced Settings</span>
                  </div>
                  {showAdvanced ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="animate-slide-up space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="negativePrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-muted-foreground">Negative Prompt</FormLabel>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="steps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-muted-foreground">Steps</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            className="input-ios"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cfgScale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-muted-foreground">CFG Scale</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            step="0.5"
                            className="input-ios"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 7)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="seed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-muted-foreground">Seed (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Random if empty"
                          className="input-ios"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduler"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-muted-foreground">Scheduler</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-ios">
                            <SelectValue placeholder="Default scheduler" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="euler">Euler</SelectItem>
                          <SelectItem value="euler_ancestral">Euler Ancestral</SelectItem>
                          <SelectItem value="dpm_solver">DPM Solver</SelectItem>
                          <SelectItem value="ddim">DDIM</SelectItem>
                          <SelectItem value="plms">PLMS</SelectItem>
                        </SelectContent>
                      </Select>
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
              {generateImagesMutation.isPending ? "Creating Magic..." : "Generate Images"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Loading State */}
      {generateImagesMutation.isPending && (
        <div className="card-ios-elevated p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="text-primary-foreground w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">Creating Your Masterpiece</h3>
          <p className="text-muted-foreground mb-6 text-lg">Our AI is painting your vision into reality...</p>
          <Progress value={undefined} className="w-full max-w-sm mx-auto h-2" />
          <p className="text-xs text-muted-foreground mt-4">This usually takes 30-60 seconds</p>
        </div>
      )}
    </div>
  );
}