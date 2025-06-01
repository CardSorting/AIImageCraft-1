import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Sparkles, Gamepad2, Users, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Icon mapping for categories
const iconMap = {
  Sparkles: Sparkles,
  Crown: Users,
  Heart: Users,
  Star: Users,
  Palette: Palette,
  Gamepad2: Gamepad2,
  Zap: Sparkles,
  WandSparkles: Sparkles,
  Shield: Users,
  Camera: Sparkles,
  Rocket: Sparkles,
};

// Main category definitions
const mainCategories = [
  {
    id: "entertainment",
    name: "Entertainment & Pop Culture",
    shortName: "Entertainment",
    icon: Gamepad2,
    description: "Anime, gaming, movies, TV shows, and pop culture",
    color: "blue"
  },
  {
    id: "fashion",
    name: "Fashion & Lifestyle",
    shortName: "Fashion",
    icon: Sparkles,
    description: "Fashion trends, aesthetics, and lifestyle looks",
    color: "pink"
  },
  {
    id: "lifestyle",
    name: "Professional & Social",
    shortName: "Lifestyle",
    icon: Users,
    description: "Professional, dating, and social occasion styles",
    color: "green"
  },
  {
    id: "creative",
    name: "Creative & Artistic",
    shortName: "Creative",
    icon: Palette,
    description: "Artistic, fantasy, and creative expression",
    color: "purple"
  }
];

const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950",
    pink: "border-pink-200 dark:border-pink-800 hover:bg-pink-50 dark:hover:bg-pink-950",
    green: "border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950",
    purple: "border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950"
  };
  return colorMap[color] || colorMap.blue;
};

function CategoryCard({ category, mainCategoryColor }: { category: any, mainCategoryColor: string }) {
  const IconComponent = iconMap[category.iconName as keyof typeof iconMap] || Sparkles;
  
  return (
    <Link href={`/category/${category.categoryId}`}>
      <Card className={`transition-all duration-200 cursor-pointer ${getColorClasses(mainCategoryColor)}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <IconComponent className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {category.name}
                </h3>
                {category.featured && (
                  <Badge variant="secondary" className="text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {category.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CategoryGrid({ mainCategory }: { mainCategory: string }) {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/style-categories', mainCategory],
    queryFn: async () => {
      const response = await fetch(`/api/style-categories?mainCategory=${mainCategory}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const mainCategoryInfo = mainCategories.find(cat => cat.id === mainCategory);
  const featuredCategories = categories.filter((cat: any) => cat.featured === 1 || cat.featured === true);
  const regularCategories = categories.filter((cat: any) => cat.featured === 0 || cat.featured === false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {featuredCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Featured Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCategories.map((category: any) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                mainCategoryColor={mainCategoryInfo?.color || "blue"}
              />
            ))}
          </div>
        </div>
      )}

      {regularCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            All Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularCategories.map((category: any) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                mainCategoryColor={mainCategoryInfo?.color || "blue"}
              />
            ))}
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No categories found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Categories for this section are coming soon.
          </p>
        </div>
      )}
    </div>
  );
}

export default function StyleCategories() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("entertainment");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/ai-cosplay')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to AI Cosplay
              </Button>
              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Style Library
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore categories and find your perfect style
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
              {mainCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex flex-col items-center gap-2 p-4 text-sm font-medium transition-all duration-200 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800"
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.shortName}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {/* Active Tab Description */}
            <div className="mt-4 text-center">
              {mainCategories.map((category) => (
                activeTab === category.id && (
                  <p key={category.id} className="text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                )
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {mainCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <CategoryGrid mainCategory={category.id} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}