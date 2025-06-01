import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Image as ImageIcon, 
  Bot, 
  User, 
  Sparkles, 
  Download, 
  Upload,
  Wand2,
  Eye,
  Palette,
  Layers
} from "lucide-react";

// Domain Models
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  originalImageUrl?: string;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'error';
  editType?: 'enhance' | 'style' | 'background' | 'object' | 'color';
}

interface EditRequest {
  prompt: string;
  imageUrl: string;
  editType: string;
}

// Validation Schema
const messageSchema = z.object({
  prompt: z.string().min(1, "Please describe what you'd like me to edit").max(500, "Keep instructions under 500 characters"),
});

type MessageInput = z.infer<typeof messageSchema>;

export default function AIDesigner() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Designer assistant. Upload an image and tell me how you'd like to edit it. I can enhance details, change styles, modify backgrounds, add or remove objects, and adjust colors.",
      timestamp: new Date(),
    }
  ]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Check authentication
  const { data: authStatus } = useQuery<{ isAuthenticated: boolean; user?: any }>({
    queryKey: ['/api/auth/profile'],
    refetchInterval: 30000,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (authStatus && !authStatus.isAuthenticated) {
      window.location.href = '/login';
    }
  }, [authStatus]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Image edit mutation using existing FLUX Kontext endpoint
  const editImageMutation = useMutation({
    mutationFn: async (data: EditRequest) => {
      const formData = new FormData();
      
      // Convert image URL to blob and append to FormData
      const imageResponse = await fetch(data.imageUrl);
      const imageBlob = await imageResponse.blob();
      formData.append('image', imageBlob, 'edit-image.jpg');
      formData.append('prompt', data.prompt);
      formData.append('editType', data.editType);

      const response = await fetch('/api/generate-cosplay', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to edit image');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      setMessages(prev => prev.map(msg => 
        msg.id === 'temp-processing' 
          ? {
              ...msg,
              id: Date.now().toString(),
              content: "Here's your edited image! What would you like me to adjust next?",
              imageUrl: data.images?.[0]?.imageUrl || data.imageUrl,
              status: 'completed' as const,
            }
          : msg
      ));
      setIsProcessing(false);
      
      toast({
        title: "Image Edited Successfully!",
        description: "Your image has been processed. Ready for the next edit?",
      });
    },
    onError: (error: any) => {
      setMessages(prev => prev.map(msg => 
        msg.id === 'temp-processing' 
          ? {
              ...msg,
              id: Date.now().toString(),
              content: "Sorry, I encountered an error while editing your image. Please try again with a different approach.",
              status: 'error' as const,
            }
          : msg
      ));
      setIsProcessing(false);
      
      toast({
        title: "Edit Failed",
        description: error.message || "Please try a different editing instruction.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        
        // Add user message with uploaded image
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: "I've uploaded an image for editing.",
          imageUrl,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Perfect! I can see your image. Now tell me what you'd like me to edit. For example:\n• \"Make the background more vibrant\"\n• \"Add a sunset sky\"\n• \"Remove the person in the background\"\n• \"Change the style to watercolor painting\"",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectEditType = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('background') || lowerPrompt.includes('sky') || lowerPrompt.includes('scene')) {
      return 'background';
    } else if (lowerPrompt.includes('style') || lowerPrompt.includes('painting') || lowerPrompt.includes('artistic')) {
      return 'style';
    } else if (lowerPrompt.includes('color') || lowerPrompt.includes('tone') || lowerPrompt.includes('hue')) {
      return 'color';
    } else if (lowerPrompt.includes('add') || lowerPrompt.includes('remove') || lowerPrompt.includes('object')) {
      return 'object';
    } else {
      return 'enhance';
    }
  };

  const onSubmit = (data: MessageInput) => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload an image first before giving editing instructions.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: data.prompt,
      timestamp: new Date(),
    };

    // Add temporary processing message
    const processingMessage: ChatMessage = {
      id: 'temp-processing',
      role: 'assistant',
      content: "I'm working on your edit request...",
      timestamp: new Date(),
      status: 'pending',
    };

    setMessages(prev => [...prev, userMessage, processingMessage]);
    setIsProcessing(true);

    // Detect edit type and make API call
    const editType = detectEditType(data.prompt);
    editImageMutation.mutate({
      prompt: data.prompt,
      imageUrl: selectedImage,
      editType,
    });

    form.reset();
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-edited-${Date.now()}.png`;
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

  if (!authStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">AI Designer</h1>
              <p className="text-sm text-muted-foreground">Chat-based image editing with FLUX Kontext</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 md:px-6 py-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[85%] md:max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <Card className={`${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-card/80 backdrop-blur-xl border-border/50'
                  } ${message.status === 'pending' ? 'animate-pulse' : ''}`}>
                    <CardContent className="p-4">
                      {message.imageUrl && (
                        <div className="mb-3">
                          <div className="relative group">
                            <img 
                              src={message.imageUrl} 
                              alt="Uploaded or edited image"
                              className="w-full max-w-sm rounded-xl shadow-lg"
                            />
                            {message.role === 'assistant' && message.imageUrl && (
                              <Button
                                onClick={() => downloadImage(message.imageUrl!)}
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${
                          message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {message.status === 'pending' && (
                          <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-card/80 backdrop-blur-xl border-t border-border/50 px-4 md:px-6 py-4">
          {/* Quick Actions */}
          {!selectedImage && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-muted-foreground">Quick Actions:</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button variant="outline" size="sm" className="justify-start" disabled>
                  <Palette className="h-4 w-4 mr-2" />
                  Color Edit
                </Button>
                <Button variant="outline" size="sm" className="justify-start" disabled>
                  <Eye className="h-4 w-4 mr-2" />
                  Style Transfer
                </Button>
                <Button variant="outline" size="sm" className="justify-start" disabled>
                  <Layers className="h-4 w-4 mr-2" />
                  Background
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
            <div className="flex-1">
              <Textarea
                placeholder={selectedImage ? "Tell me how to edit your image..." : "Upload an image first, then describe your edit..."}
                className="min-h-[60px] resize-none border-2 border-border/50 rounded-2xl bg-background/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-200"
                disabled={!selectedImage || isProcessing}
                {...form.register("prompt")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
              />
              {form.formState.errors.prompt && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.prompt.message}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={!selectedImage || isProcessing}
                className="h-[60px] px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-lg transition-all duration-200"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}