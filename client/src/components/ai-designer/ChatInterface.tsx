import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Send, 
  Bot, 
  User, 
  Download,
  Upload,
  Palette,
  Eye,
  Layers
} from "lucide-react";

// Clean Architecture imports
import { ChatMessage } from '../../domain/ai-designer/entities/ChatMessage';
import { ImageEditService } from '../../domain/ai-designer/services/ImageEditService';
import { LocalChatRepository } from '../../domain/ai-designer/repositories/IChatRepository';
import { EditImageUseCase } from '../../application/ai-designer/usecases/EditImageUseCase';
import { FluxKontextApiService } from '../../infrastructure/ai-designer/FluxKontextApiService';
import { LocalChatHistoryService } from '../../domain/ai-designer/services/ChatHistoryService';

const messageSchema = z.object({
  prompt: z.string().min(1, "Please describe what you'd like me to edit").max(500, "Keep instructions under 500 characters"),
});

type MessageInput = z.infer<typeof messageSchema>;

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className = "" }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Clean Architecture dependencies
  const imageEditService = new ImageEditService();
  const chatRepository = new LocalChatRepository();
  const apiService = new FluxKontextApiService();
  const editImageUseCase = new EditImageUseCase(imageEditService, chatRepository, apiService);
  const chatHistoryService = new LocalChatHistoryService();

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      const sessionMessages = await chatHistoryService.getSessionMessages();
      setMessages(sessionMessages);
    };
    loadChatHistory();
  }, []);

  const form = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const editImageMutation = useMutation({
    mutationFn: async (data: { prompt: string; imageUrl: string }) => {
      return await editImageUseCase.execute(data.prompt, data.imageUrl);
    },
    onSuccess: async (result, variables) => {
      const updatedMessages = messages.map(msg => 
        msg.id === 'temp-processing' 
          ? {
              ...msg,
              id: Date.now().toString(),
              content: result.success 
                ? "Here's your edited image! What would you like me to adjust next?"
                : result.error || "Sorry, I encountered an error while editing your image.",
              imageUrl: result.imageUrl,
              status: result.success ? 'completed' as const : 'error' as const,
            }
          : msg
      );
      setMessages(updatedMessages);
      setIsProcessing(false);
      
      // Save to chat history
      await chatHistoryService.saveMessage(updatedMessages[updatedMessages.length - 1]);
      
      if (result.success) {
        toast({
          title: "Image edited successfully!",
          description: "Your image has been transformed. You can download it or make further edits.",
        });
      } else {
        toast({
          title: "Edit failed",
          description: result.error || "There was an error processing your image.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      const updatedMessages = messages.map(msg => 
        msg.id === 'temp-processing' 
          ? {
              ...msg,
              id: Date.now().toString(),
              content: "I'm sorry, but I encountered an error while processing your request. Please try again.",
              status: 'error' as const,
            }
          : msg
      );
      setMessages(updatedMessages);
      toast({
        title: "Error",
        description: error.message || "Failed to edit image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: MessageInput) => {
    if (!selectedImage || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: data.prompt,
      timestamp: new Date(),
      status: 'completed',
      imageUrl: selectedImage,
    };

    const assistantMessage: ChatMessage = {
      id: 'temp-processing',
      role: 'assistant',
      content: "Processing your request...",
      timestamp: new Date(),
      status: 'pending',
    };

    const newMessages = [...messages, userMessage, assistantMessage];
    setMessages(newMessages);
    setIsProcessing(true);
    form.reset();

    // Save user message to chat history
    await chatHistoryService.saveMessage(userMessage);

    // Process the image edit
    editImageMutation.mutate({ 
      prompt: data.prompt, 
      imageUrl: selectedImage 
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
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
          description: "You can now describe how you'd like to edit it.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = (imageUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your edited image is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the image. Please try right-clicking and saving.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Messages Area - ChatGPT mobile style */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-0 md:px-4">
        <div className="max-w-none">
          {messages.length === 0 ? (
            /* Welcome state - ChatGPT style */
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg mb-4">
                <Bot className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground mb-2">AI Image Designer</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md">
                Upload an image and describe how you'd like to transform it. I'll help you edit and enhance your images with AI.
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-10 text-sm border-border/50 hover:bg-muted/50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload your first image
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`group relative px-3 md:px-6 py-3 md:py-4 ${
                    message.role === 'assistant' 
                      ? 'bg-muted/30 dark:bg-muted/20' 
                      : 'bg-background'
                  } ${index === messages.length - 1 ? 'mb-4' : ''}`}
                >
                  <div className="flex gap-3 md:gap-4 max-w-4xl mx-auto">
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0 pt-1">
                      {message.role === 'assistant' ? (
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center">
                          <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                        {/* Image Content */}
                        {message.imageUrl && (
                          <div className="mb-3">
                            <div className="relative group">
                              <img 
                                src={message.imageUrl} 
                                alt="Uploaded or edited image"
                                className="w-full max-w-xs md:max-w-sm rounded-xl shadow-md hover:shadow-lg transition-shadow"
                              />
                              {message.role === 'assistant' && message.imageUrl && (
                                <Button
                                  onClick={() => downloadImage(message.imageUrl!)}
                                  size="sm"
                                  variant="secondary"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm bg-background/80 hover:bg-background/90 border-0 shadow-lg"
                                >
                                  <Download className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Text Content */}
                        <div className="text-sm md:text-base leading-relaxed whitespace-pre-line">
                          {message.content}
                        </div>
                        
                        {/* Message Footer */}
                        <div className="flex items-center justify-between mt-2 opacity-60">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.status === 'pending' && (
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ChatGPT-style Input Area */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/20 px-3 md:px-6 py-3 md:py-4 safe-area-bottom">
        
        {/* Quick Actions for first-time users */}
        {!selectedImage && (
          <div className="mb-3 md:mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="flex-shrink-0 h-8 text-xs px-3 rounded-full border-border/50 hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-3 w-3 mr-1.5" />
                Upload Image
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0 h-8 text-xs px-3 rounded-full border-border/50 opacity-50" 
                disabled
              >
                <Palette className="h-3 w-3 mr-1.5" />
                Color Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0 h-8 text-xs px-3 rounded-full border-border/50 opacity-50" 
                disabled
              >
                <Eye className="h-3 w-3 mr-1.5" />
                Style Transfer
              </Button>
            </div>
          </div>
        )}

        {/* Input form - ChatGPT mobile style */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div className="relative flex items-end gap-2 bg-muted/30 dark:bg-muted/20 rounded-2xl md:rounded-3xl border border-border/30 p-2 md:p-3 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-background/80">
            
            {/* Text input area */}
            <div className="flex-1 min-h-0">
              <Textarea
                placeholder={selectedImage ? "Describe how you'd like to edit your image..." : "Upload an image first to start editing..."}
                className="min-h-[20px] max-h-32 resize-none border-0 bg-transparent p-0 text-sm md:text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
                disabled={!selectedImage || isProcessing}
                {...form.register("prompt")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                }}
              />
            </div>
            
            {/* Send button */}
            <Button
              type="submit"
              disabled={!selectedImage || isProcessing || !form.watch("prompt")?.trim()}
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="h-3.5 w-3.5 text-primary-foreground" />
            </Button>
          </div>
        </form>

        {/* Selected image preview */}
        {selectedImage && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/30">
              <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
            </div>
            <span className="flex-1 truncate">Image ready for editing</span>
            <Button
              onClick={() => setSelectedImage(null)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
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