// Simplified Chat Interface for AI Designer with Flux Integration
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Download, Upload, Sparkles } from "lucide-react";

const messageSchema = z.object({
  prompt: z.string().min(1, "Please describe your edit").max(500, "Keep instructions under 500 characters"),
});

type MessageInput = z.infer<typeof messageSchema>;

interface SimpleMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface SimpleChatInterfaceProps {
  className?: string;
}

export function SimpleChatInterface({ className = "" }: SimpleChatInterfaceProps) {
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: { prompt: "" },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  // Image generation using the working Flux endpoint
  const generateImageMutation = useMutation({
    mutationFn: async ({ image, instruction }: { image: string; instruction: string }) => {
      // Convert base64 data URL to blob
      const response = await fetch(image);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'edit-image.jpg');
      formData.append('modelId', 'bfl:4@1');
      formData.append('instruction', instruction);
      
      const apiResponse = await fetch('/api/generate-cosplay', {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error('Failed to generate image');
      }
      
      return apiResponse.json();
    },
    onSuccess: (data) => {
      if (data.success && data.image?.url) {
        // Add assistant message with generated image
        const assistantMessage: SimpleMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Here\'s your edited image:',
          timestamp: new Date(),
          imageUrl: data.image.url,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        toast({
          title: "Image edited successfully",
          description: "Your image has been transformed",
        });
      } else {
        toast({
          title: "Generation completed",
          description: "But no image was returned. Please try again.",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Edit failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: MessageInput) => {
    if (!selectedImage || isProcessing) return;

    const userMessage: SimpleMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: data.prompt,
      timestamp: new Date(),
      imageUrl: selectedImage,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    form.reset();

    await generateImageMutation.mutateAsync({
      image: selectedImage,
      instruction: data.prompt,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      
      toast({
        title: "Image uploaded",
        description: "Now describe how you'd like to edit it",
      });
    };
    reader.readAsDataURL(file);
  };

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `edited-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded",
      description: "Image saved to your device",
    });
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-0">
        <div className="pb-4">
          {messages.length === 0 ? (
            /* Welcome state */
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6 animate-pulse">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-3">
                AI Image Designer
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-sm leading-relaxed">
                Transform your images with natural language. Upload a photo and describe your vision.
              </p>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="h-12 px-8 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Upload className="h-5 w-5 mr-3" />
                Choose Image
              </Button>
            </div>
          ) : (
            /* Message list */
            <div className="space-y-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`px-4 py-4 ${
                    message.role === 'assistant' 
                      ? 'bg-muted/20' 
                      : 'bg-background'
                  }`}
                >
                  <div className="flex gap-3 max-w-4xl mx-auto">
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0 pt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                        message.role === 'assistant'
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                          : 'bg-gradient-to-br from-gray-600 to-gray-800'
                      }`}>
                        {message.role === 'assistant' ? (
                          <Bot className="h-4 w-4 text-white" />
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      {/* Image content */}
                      {message.imageUrl && (
                        <div className="mb-3">
                          <div className="relative group inline-block">
                            <img 
                              src={message.imageUrl} 
                              alt="Image"
                              className="max-w-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200"
                            />
                            {message.role === 'assistant' && (
                              <Button
                                onClick={() => downloadImage(message.imageUrl!)}
                                size="sm"
                                variant="secondary"
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 border-0"
                              >
                                <Download className="h-3.5 w-3.5 text-white" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Text content */}
                      <div className="prose prose-sm max-w-none">
                        <p className="text-foreground text-[15px] leading-relaxed m-0 font-normal">
                          {message.content}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="mt-2 text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Image upload */}
            {selectedImage && (
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="text-sm text-muted-foreground">Image uploaded</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Remove
                </Button>
              </div>
            )}

            {/* Text input */}
            <div className="flex gap-3">
              <Textarea
                {...form.register("prompt")}
                placeholder={selectedImage ? "Describe how you'd like to edit this image..." : "Upload an image first"}
                disabled={!selectedImage || isProcessing}
                className="flex-1 min-h-[44px] resize-none rounded-2xl border-2 focus:border-blue-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
              />
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-11 w-11 rounded-xl"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                
                <Button
                  type="submit"
                  disabled={!selectedImage || isProcessing || !form.watch("prompt")}
                  size="icon"
                  className="h-11 w-11 rounded-xl bg-blue-500 hover:bg-blue-600"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {form.formState.errors.prompt && (
              <p className="text-sm text-red-500">
                {form.formState.errors.prompt.message}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}