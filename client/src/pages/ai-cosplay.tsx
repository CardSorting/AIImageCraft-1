import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SEOHead } from "@/components/SEOHead";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, Sparkles, Star, Crown, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StyleCard {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  popular?: boolean;
}

const STYLE_CATEGORIES = [
  {
    name: "Movie Characters",
    styles: [
      { id: "marvel-hero", name: "Marvel Superhero", description: "Classic comic book superhero style", icon: Crown, popular: true },
      { id: "jedi-knight", name: "Jedi Knight", description: "Star Wars Jedi warrior", icon: Wand2, popular: true },
      { id: "pirate-captain", name: "Pirate Captain", description: "Swashbuckling pirate adventure", icon: Star },
      { id: "wizard", name: "Fantasy Wizard", description: "Magical wizard with robes and staff", icon: Sparkles },
    ]
  },
  {
    name: "TV Shows",
    styles: [
      { id: "detective", name: "TV Detective", description: "Classic detective show character", icon: Star },
      { id: "sci-fi-officer", name: "Sci-Fi Officer", description: "Space exploration uniform", icon: Crown },
      { id: "medieval-knight", name: "Medieval Knight", description: "Game of Thrones style armor", icon: Wand2 },
      { id: "western-cowboy", name: "Western Cowboy", description: "Wild west gunslinger", icon: Star },
    ]
  },
  {
    name: "Anime Characters",
    styles: [
      { id: "anime-hero", name: "Anime Hero", description: "Classic shounen protagonist style", icon: Sparkles, popular: true },
      { id: "magical-girl", name: "Magical Girl", description: "Sailor Moon inspired transformation", icon: Star, popular: true },
      { id: "ninja-warrior", name: "Ninja Warrior", description: "Naruto-style ninja outfit", icon: Wand2 },
      { id: "mech-pilot", name: "Mech Pilot", description: "Gundam pilot suit", icon: Crown },
    ]
  },
  {
    name: "Artwork Styles",
    styles: [
      { id: "renaissance", name: "Renaissance Portrait", description: "Classical European painting style", icon: Crown },
      { id: "pop-art", name: "Pop Art", description: "Andy Warhol inspired style", icon: Star },
      { id: "cyberpunk", name: "Cyberpunk", description: "Futuristic neon aesthetic", icon: Sparkles, popular: true },
      { id: "steampunk", name: "Steampunk", description: "Victorian era mechanical style", icon: Wand2 },
    ]
  }
];

export default function AICosplayPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Movie Characters");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    const styleMap: Record<string, string> = {
      "marvel-hero": "a Marvel superhero with cape and costume",
      "jedi-knight": "a Jedi Knight with lightsaber and robes",
      "pirate-captain": "a pirate captain with hat and sword",
      "wizard": "a fantasy wizard with magical robes and staff",
      "detective": "a classic TV detective with coat and hat",
      "sci-fi-officer": "a sci-fi space officer in uniform",
      "medieval-knight": "a medieval knight in shining armor",
      "western-cowboy": "a western cowboy with hat and boots",
      "anime-hero": "an anime hero with spiky hair and determined expression",
      "magical-girl": "a magical girl with colorful outfit and accessories",
      "ninja-warrior": "a ninja warrior with mask and traditional outfit",
      "mech-pilot": "a mech pilot in futuristic suit",
      "renaissance": "a Renaissance-era noble in classical portrait style",
      "pop-art": "a pop art character with bold colors and comic style",
      "cyberpunk": "a cyberpunk character with neon and futuristic elements",
      "steampunk": "a steampunk character with Victorian and mechanical elements",
    };
    return styleMap[styleId] || "a character";
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

  const currentStyles = STYLE_CATEGORIES.find(cat => cat.name === activeCategory)?.styles || [];

  return (
    <>
      <SEOHead 
        title="AI Cosplay - Transform into Your Favorite Characters"
        description="Upload your photo and transform into popular characters from movies, TV shows, anime, and artwork using AI"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <NavigationHeader />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              AI Cosplay Studio
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Transform your photos into popular characters from movies, TV shows, anime, and artwork. 
              Upload your image and choose a character style for instant cosplay transformation.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            {/* Left Column - Image Upload */}
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Upload Your Photo
                  </h3>
                  
                  <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
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
                          className="max-w-full h-64 object-cover rounded-lg mx-auto"
                        />
                        <Button 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium">Choose an image to upload</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button variant="outline" className="pointer-events-none">
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
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {generateCosplay.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Generating Cosplay...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Cosplay
                  </>
                )}
              </Button>
            </div>

            {/* Right Column - Style Selection */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Choose Your Style
                  </h3>

                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {STYLE_CATEGORIES.map((category) => (
                      <Button
                        key={category.name}
                        variant={activeCategory === category.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(category.name)}
                        className="text-xs"
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>

                  {/* Style Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {currentStyles.map((style) => (
                      <Card
                        key={style.id}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          selectedStyle === style.id
                            ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedStyle(style.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <style.icon className="w-8 h-8 text-purple-600" />
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{style.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{style.description}</p>
                          {style.popular && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Popular
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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