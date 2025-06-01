import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StyleDiscovery } from "@/components/cosplay/StyleDiscovery";
import { StyleRecommendations } from "@/components/cosplay/StyleRecommendations";
import { Upload, Image as ImageIcon, Sparkles, Star, Library, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { COSPLAY_STYLE_LIBRARY, getCategoryById, getStyleById } from "@shared/cosplayStyles";



export default function AICosplayPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<any | null>(null);
  const [recentStyles, setRecentStyles] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Check for selected style in localStorage and URL parameter
  useEffect(() => {
    // First check localStorage for selected style data
    const savedStyle = localStorage.getItem('selectedCosplayStyle');
    if (savedStyle) {
      try {
        const styleData = JSON.parse(savedStyle);
        setSelectedStyle(styleData);
        setRecentStyles(prev => [styleData.styleId, ...prev.filter(id => id !== styleData.styleId)].slice(0, 10));
      } catch (error) {
        console.error('Failed to parse saved style:', error);
      }
    }

    // Also check URL parameter as fallback
    const urlParams = new URLSearchParams(window.location.search);
    const styleParam = urlParams.get('selectedStyle');
    if (styleParam && !selectedStyle) {
      // If we have URL param but no localStorage, we need to fetch the style data
      // For now, just store the ID
      setSelectedStyle({ styleId: styleParam });
      setRecentStyles(prev => [styleParam, ...prev.filter(id => id !== styleParam)].slice(0, 10));
    }
  }, [location]);

  // Clear selected style function
  const clearSelectedStyle = () => {
    setSelectedStyle(null);
    localStorage.removeItem('selectedCosplayStyle');
    toast({
      title: "Style cleared",
      description: "You can now select a new style"
    });
  };

  // Get user profile for authentication
  const { data: profile } = useQuery({
    queryKey: ['/api/auth/profile'],
  }) as { data?: { isAuthenticated: boolean; user: any } };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCosplay = useMutation({
    mutationFn: async ({ image, style }: { image: File; style: string }) => {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('modelId', 'bfl:4@1');
      formData.append('instruction', `Transform this person into ${getStyleInstruction(style)}`);
      
      const response = await fetch('/api/generate-cosplay', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate cosplay');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.image?.url) {
        setGeneratedImage(data.image.url);
        setShowResults(true);
        toast({
          title: "Cosplay generated!",
          description: "Your character transformation is ready",
        });
      } else {
        toast({
          title: "Generation completed",
          description: "But no image was returned. Please try again.",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStyleInstruction = (styleId: string): string => {
    const style = getStyleById(styleId);
    return style?.prompt || "a character";
  };

  const getStyleName = (styleId: string | null): string => {
    if (!styleId) return "Unknown Style";
    const style = getStyleById(styleId);
    return style?.name || "Unknown Style";
  };

  const handleGenerate = () => {
    if (!selectedImage || !selectedStyle) {
      toast({
        title: "Missing requirements",
        description: "Please upload an image and select a style",
        variant: "destructive",
      });
      return;
    }

    if (!profile || !profile.isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate cosplay images",
        variant: "destructive",
      });
      return;
    }

    generateCosplay.mutate({ image: selectedImage, style: selectedStyle });
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    
    // Track recently selected styles for recommendations
    setRecentStyles(prev => {
      const updated = [styleId, ...prev.filter(id => id !== styleId)];
      return updated.slice(0, 10); // Keep last 10 selections
    });
  };

  return (
    <>
      <SEOHead 
        title="AI Cosplay - Transform into Your Favorite Characters"
        description="Upload your photo and transform into popular characters from movies, TV shows, anime, and artwork using AI"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 pb-20 md:pb-0">
        <NavigationHeader />
        
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-3 md:mb-4">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4">
              AI Cosplay Studio
            </h1>
            <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2 leading-relaxed">
              Transform your photos into popular characters from movies, TV shows, anime, and artwork. 
              Upload your image and choose a character style for instant cosplay transformation.
            </p>
          </div>

          <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-8">
            {/* Mobile-First Layout - Image Upload */}
            <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
              <Card className="overflow-hidden border-0 shadow-lg rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                    Upload Your Photo
                  </h3>
                  
                  <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl md:rounded-lg p-6 md:p-8 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer active:scale-[0.98] hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                    onClick={() => {
                      if (!imagePreview) {
                        document.getElementById('image-upload')?.click();
                      }
                    }}
                  >
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full h-48 md:h-64 object-cover rounded-xl mx-auto shadow-md"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="rounded-xl"
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 md:space-y-4">
                        <Upload className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-base md:text-lg font-medium">Choose an image to upload</p>
                          <p className="text-xs md:text-sm text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button variant="outline" size="sm" className="pointer-events-none rounded-xl">
                          Browse Files
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!selectedImage || !selectedStyle || generateCosplay.isPending}
                className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
              >
                {generateCosplay.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2" />
                    Generating Cosplay...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Generate Cosplay
                  </>
                )}
              </Button>
            </div>

            {/* Style Selection - Mobile First */}
            <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
              <Card className="overflow-hidden border-0 shadow-lg rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                      <Star className="w-4 h-4 md:w-5 md:h-5" />
                      Choose Your Style
                    </h3>
                    <Link href="/style-library">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-sm rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Library className="w-4 h-4 mr-2" />
                        Browse All
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  {/* Selected Style Display */}
                  {selectedStyle && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-green-900 dark:text-green-100">
                              {selectedStyle.name || 'Selected Style'}
                            </p>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">
                              Active
                            </span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                            {selectedStyle.description || 'Ready to transform your photo'}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Style is locked in for generation. Clear to choose a different one.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSelectedStyle}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 border-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                        >
                          Clear Style
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Advanced Style Discovery Interface */}
                  {!selectedStyle && (
                    <StyleDiscovery
                      selectedStyle={selectedStyle}
                      onStyleSelect={handleStyleSelect}
                    />
                  )}

                  {/* Style Selection Disabled Message */}
                  {selectedStyle && (
                    <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Style Ready!</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Your selected style is locked in and ready for generation. Upload an image above to begin.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Clear the current style to browse and select a different one.
                      </p>
                    </div>
                  )}

                  {/* Smart Recommendations */}
                  {selectedStyle && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <StyleRecommendations
                        selectedStyle={selectedStyle}
                        recentStyles={recentStyles}
                        onStyleSelect={handleStyleSelect}
                        maxRecommendations={6}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {showResults && generatedImage && (
          <div className="max-w-4xl mx-auto mt-12">
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Your Cosplay Transformation</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Here's your character transformation using {getStyleName(selectedStyle)}
                  </p>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  {/* Original Image */}
                  {imagePreview && (
                    <div className="flex-1 space-y-3">
                      <h3 className="text-lg font-semibold text-center">Original</h3>
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Original" 
                          className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Arrow or VS */}
                  <div className="flex items-center justify-center p-4">
                    <div className="text-2xl font-bold text-purple-600 bg-purple-100 dark:bg-purple-900 rounded-full w-12 h-12 flex items-center justify-center">
                      →
                    </div>
                  </div>
                  
                  {/* Generated Image */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold text-center">Transformed</h3>
                    <div className="relative">
                      <img 
                        src={generatedImage} 
                        alt="Generated cosplay" 
                        className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mt-8">
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedImage;
                      link.download = `cosplay-${Date.now()}.png`;
                      link.click();
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Download Image
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      setGeneratedImage(null);
                      setSelectedImage(null);
                      setImagePreview(null);
                      setSelectedStyle(null);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Create Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}