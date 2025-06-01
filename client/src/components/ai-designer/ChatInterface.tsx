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
      
      // Save the completed message to chat history
      const completedMessage = updatedMessages.find(msg => msg.id !== 'temp-processing');
      if (completedMessage) {
        await chatHistoryService.saveMessage(completedMessage);
      }
      
      setIsProcessing(false);
      
      if (result.success) {
        toast({
          title: "Image Edited Successfully!",
          description: "Your image has been processed. Ready for the next edit?",
        });
      } else {
        toast({
          title: "Edit Failed",
          description: result.error || "Please try a different editing instruction.",
          variant: "destructive",
        });
      }
    },
    onError: async (error: any) => {
      const updatedMessages = messages.map(msg => 
        msg.id === 'temp-processing' 
          ? {
              ...msg,
              id: Date.now().toString(),
              content: "Sorry, I encountered an error while editing your image. Please try again with a different approach.",
              status: 'error' as const,
            }
          : msg
      );
      
      setMessages(updatedMessages);
      
      // Save the error message to chat history
      const errorMessage = updatedMessages.find(msg => msg.status === 'error');
      if (errorMessage) {
        await chatHistoryService.saveMessage(errorMessage);
      }
      
      setIsProcessing(false);
      
      toast({
        title: "Edit Failed",
        description: error.message || "Please try a different editing instruction.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: "I've uploaded an image for editing.",
          imageUrl,
          timestamp: new Date(),
        };
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Perfect! I can see your image. Now tell me what you'd like me to edit. For example:\n• \"Make the background more vibrant\"\n• \"Add a sunset sky\"\n• \"Remove the person in the background\"\n• \"Change the style to watercolor painting\"",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newMessage, assistantMessage]);
        
        // Save messages to chat history
        await chatHistoryService.saveMessage(newMessage);
        await chatHistoryService.saveMessage(assistantMessage);
      };
      reader.readAsDataURL(file);
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

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: data.prompt,
      timestamp: new Date(),
    };

    const processingMessage: ChatMessage = {
      id: 'temp-processing',
      role: 'assistant',
      content: "I'm working on your edit request...",
      timestamp: new Date(),
      status: 'pending',
    };

    setMessages(prev => [...prev, userMessage, processingMessage]);
    setIsProcessing(true);

    editImageMutation.mutate({
      prompt: data.prompt,
      imageUrl: selectedImage,
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

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Messages - Mobile-first ChatGPT style */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-3 md:px-6 py-2 md:py-4">
        <div className="space-y-4 md:space-y-6 max-w-none">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 md:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant Avatar - Only on desktop or when needed */}
              {message.role === 'assistant' && (
                <div className="hidden md:flex">
                  <Avatar className="w-6 h-6 md:w-8 md:h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      <Bot className="h-3 w-3 md:h-4 md:w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {/* Message Content */}
              <div className={`flex-1 max-w-[85%] md:max-w-[70%] ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                {/* ChatGPT-style message bubble */}
                <div className={`
                  relative rounded-2xl md:rounded-3xl px-3 py-3 md:px-4 md:py-4 
                  ${message.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto max-w-[90%]' 
                    : 'bg-muted/50 dark:bg-muted/30 text-foreground border border-border/30'
                  } 
                  ${message.status === 'pending' ? 'animate-pulse' : ''}
                  transition-all duration-200 hover:shadow-sm
                `}>
                  
                  {/* Image Content */}
                  {message.imageUrl && (
                    <div className="mb-3">
                      <div className="relative group">
                        <img 
                          src={message.imageUrl} 
                          alt="Uploaded or edited image"
                          className="w-full max-w-xs md:max-w-sm rounded-xl md:rounded-2xl shadow-md hover:shadow-lg transition-shadow"
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
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs opacity-60 ${
                      message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {/* Typing indicator */}
                    {message.status === 'pending' && (
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Avatar - Mobile hidden, desktop shown */}
              {message.role === 'user' && (
                <div className="hidden md:flex">
                  <Avatar className="w-6 h-6 md:w-8 md:h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <User className="h-3 w-3 md:h-4 md:w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area - ChatGPT mobile style */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/30 px-3 md:px-6 py-3 md:py-4 safe-area-bottom">
        {/* Quick Actions - Mobile optimized */}
        {!selectedImage && (
          <div className="mb-3 md:mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Quick Actions:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
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
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0 h-8 text-xs px-3 rounded-full border-border/50 opacity-50" 
                disabled
              >
                <Layers className="h-3 w-3 mr-1.5" />
                Background
              </Button>
            </div>
          </div>
        )}

        {/* ChatGPT-style input form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <div className="relative flex items-end gap-2 bg-muted/30 dark:bg-muted/20 rounded-2xl md:rounded-3xl border border-border/30 p-2 md:p-3 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-background/80">
            
            {/* Text input area */}
            <div className="flex-1 min-h-0">
              <Textarea
                placeholder={selectedImage ? "Tell me how to edit your image..." : "Upload an image first to start editing..."}
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
              className={`
                flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl p-0 transition-all duration-200
                ${(!selectedImage || isProcessing || !form.watch("prompt")?.trim())
                  ? 'bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95'
                }
              `}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
              )}
            </Button>
          </div>

          {/* Error message */}
          {form.formState.errors.prompt && (
            <p className="text-xs text-destructive mt-2 px-1">{form.formState.errors.prompt.message}</p>
          )}
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Mobile tip */}
        <div className="mt-2 text-center md:hidden">
          <p className="text-xs text-muted-foreground/60">
            Tap to start editing • Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}