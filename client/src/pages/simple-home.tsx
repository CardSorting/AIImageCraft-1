import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Image, Zap, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function SimpleHome() {
  // Get total images count for the badge
  const { data: images } = useQuery({
    queryKey: ["/api/images"],
  });

  const imageCount = Array.isArray(images) ? images.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Image Studio
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into stunning AI-generated images with cutting-edge technology
          </p>
          {imageCount > 0 && (
            <Badge variant="outline" className="mt-4 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
              {imageCount} Images Created
            </Badge>
          )}
        </div>

        {/* Main Action */}
        <div className="text-center mb-16">
          <Link href="/generate">
            <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <Zap className="h-5 w-5 mr-2" />
              Start Creating
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Image className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered Generation</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI models create high-quality images from your text descriptions
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Multiple Models</h3>
              <p className="text-sm text-muted-foreground">
                Choose from various AI models to match your creative vision
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fast & Easy</h3>
              <p className="text-sm text-muted-foreground">
                Generate professional-quality images in seconds with simple prompts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/gallery">
            <Button variant="outline" className="rounded-lg">
              View Gallery
            </Button>
          </Link>
          <Link href="/models">
            <Button variant="outline" className="rounded-lg">
              Browse Models
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="outline" className="rounded-lg">
              My History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}