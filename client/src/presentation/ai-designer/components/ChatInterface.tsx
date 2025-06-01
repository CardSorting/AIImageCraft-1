// Presentation Layer - Following Apple's Design Philosophy
import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Download, Upload, Sparkles, Palette, Eye } from "lucide-react";

// Simple message interface
interface SimpleMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

const messageSchema = z.object({
  prompt: z.string().min(1, "Please describe your edit").max(500, "Keep instructions under 500 characters"),
});

type MessageInput = z.infer<typeof messageSchema>;

interface ChatInterfaceProps {
  className?: string;
  sessionId?: string | null;
  onSessionCreated?: (session: import('../../../lib/sessionStorage').ChatSession) => void;
}

export function ChatInterface({ className = "", sessionId, onSessionCreated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: { prompt: "" },
  });

  // Update session ID when prop changes
  useEffect(() => {
    setCurrentSessionId(sessionId || null);
  }, [sessionId]);

  // Chat history - simplified for now
  // TODO: Implement database-backed chat history loading

  // Auto-scroll with smooth iOS-like animation
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

  // Edit image mutation using the working Flux endpoint
  const editImageMutation = useMutation({
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
        const assistantMessage = {
          id: crypto.randomUUID(),
          role: 'assistant' as const,
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

    // Create session if it doesn't exist
    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSession = SessionStorageService.createNewSession(data.prompt, selectedImage);
      sessionId = newSession.id;
      setCurrentSessionId(sessionId);
      onSessionCreated?.(newSession);
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: data.prompt,
      timestamp: new Date(),
      imageUrl: selectedImage,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    form.reset();

    await editImageMutation.mutateAsync({
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
      
      // Apple-style haptic feedback simulation
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      toast({
        title: "Image ready",
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

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Chat Messages - Apple-inspired design */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-0">
        <div className="pb-4">
          {messages.length === 0 ? (
            /* Welcome state with Apple-like hierarchy */
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
            /* Message list with Apple-like spacing */
            <div className="space-y-1">
              {messages.map((message, index) => (
                <div
                  key={message.id.value}
                  className={`px-4 py-4 ${
                    message.isFromAssistant() 
                      ? 'bg-muted/20' 
                      : 'bg-background'
                  }`}
                >
                  <div className="flex gap-3 max-w-4xl mx-auto">
                    
                    {/* Avatar with Apple-style design */}
                    <div className="flex-shrink-0 pt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                        message.isFromAssistant()
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                          : 'bg-gradient-to-br from-gray-600 to-gray-800'
                      }`}>
                        {message.isFromAssistant() ? (
                          <Bot className="h-4 w-4 text-white" />
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Message content with Apple typography */}
                    <div className="flex-1 min-w-0">
                      {/* Image content */}
                      {message.hasImage() && (
                        <div className="mb-3">
                          <div className="relative group inline-block">
                            <img 
                              src={message.content.imageUrl} 
                              alt="Image"
                              className="max-w-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200"
                            />
                            {message.isFromAssistant() && (
                              <Button
                                onClick={() => downloadImage(message.content.imageUrl!)}
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
                      
                      {/* Text content with Apple typography */}
                      <div className="text-base leading-relaxed text-foreground">
                        {message.content.text}
                      </div>
                      
                      {/* Timestamp with Apple's subtle styling */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground font-medium">
                          {message.timestamp.value.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        
                        {/* Apple-style typing indicator */}
                        {message.isPending() && (
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area with Apple-inspired design */}
      <div className="border-t bg-background/95 backdrop-blur-xl px-4 py-4 safe-area-bottom">
        
        {/* Quick actions when image is selected - mobile optimized */}
        {selectedImage && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-xs rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors flex-1"
                disabled
              >
                <Palette className="h-3 w-3 mr-1" />
                Style
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-xs rounded-lg border-green-200 text-green-600 hover:bg-green-50 transition-colors flex-1"
                disabled
              >
                <Eye className="h-3 w-3 mr-1" />
                Enhance
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-xs rounded-lg border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors flex-1"
                disabled
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Remove BG
              </Button>
            </div>
          </div>
        )}

        {/* Apple-style input form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div className="relative flex items-end gap-3 bg-muted/30 rounded-3xl border border-border/30 p-3 transition-all duration-200 focus-within:border-blue-300 focus-within:bg-background/80">
            
            <div className="flex-1">
              <Textarea
                placeholder={selectedImage ? "Describe your edit..." : "Upload an image first"}
                className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 leading-relaxed"
                disabled={!selectedImage || isProcessing}
                {...form.register("prompt")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
              />
            </div>
            
            {/* Apple-style send button */}
            <Button
              type="submit"
              disabled={!selectedImage || isProcessing || !form.watch("prompt")?.trim()}
              size="sm"
              className="h-9 w-9 p-0 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-30 transition-all duration-200 shadow-lg disabled:shadow-none"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </form>

        {/* Selected image preview with Apple styling */}
        {selectedImage && (
          <div className="mt-3 flex items-center gap-3 p-2 bg-muted/20 rounded-2xl">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/30">
              <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
            </div>
            <span className="flex-1 text-sm text-muted-foreground font-medium truncate">
              Image ready for editing
            </span>
            <Button
              onClick={() => setSelectedImage(null)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-full"
            >
              ×
            </Button>
          </div>
        )}
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