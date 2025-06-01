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
      <Card className={`group transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${getColorClasses(mainCategoryColor)} border-2 hover:scale-[1.02] active:scale-[0.98]`}>
        <CardContent className="p-6 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-current to-transparent" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 group-hover:border-gray-300 dark:group-hover:border-gray-500 transition-all duration-300 group-hover:shadow-lg">
                <IconComponent className="w-7 h-7 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-300">
                  {category.name}
                </h3>
                {category.featured && (
                  <Badge variant="secondary" className="text-xs font-medium bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700 animate-pulse">
                    ✨ Featured
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                {category.description}
              </p>
              
              {/* Hover indicator */}
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span>Explore styles</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
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
      <div className="space-y-8 animate-in fade-in-0 duration-500">
        {/* Featured Categories Skeleton */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent dark:from-gray-700 dark:via-gray-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="group transition-all duration-300 border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-14 h-14 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4 rounded-lg" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-16 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-5/6 rounded" />
                        <Skeleton className="h-4 w-2/3 rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Categories Skeleton */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent dark:from-gray-700 dark:via-gray-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="group transition-all duration-300 border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-14 h-14 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-2/3 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-4/5 rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in-0 duration-700">
      {featuredCategories.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Featured Categories
              </h3>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-200 via-orange-200 to-transparent dark:from-amber-800 dark:via-orange-800" />
            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700">
              {featuredCategories.length} featured
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCategories.map((category: any, index: number) => (
              <div 
                key={category.id}
                className="animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CategoryCard 
                  category={category} 
                  mainCategoryColor={mainCategoryInfo?.color || "blue"}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {regularCategories.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">#</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                All Categories
              </h3>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 via-indigo-200 to-transparent dark:from-blue-800 dark:via-indigo-800" />
            <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              {regularCategories.length} total
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularCategories.map((category: any, index: number) => (
              <div 
                key={category.id}
                className="animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${(index + featuredCategories.length) * 100}ms` }}
              >
                <CategoryCard 
                  category={category} 
                  mainCategoryColor={mainCategoryInfo?.color || "blue"}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <div className="text-center py-16 animate-in fade-in-0 duration-500">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mx-auto mb-6 border-2 border-gray-200 dark:border-gray-700">
            <Palette className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            No categories found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Categories for this section are coming soon. Check back later for new styles and options.
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
          <div className="mb-10">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
              {mainCategories.map((category) => {
                const IconComponent = category.icon;
                const isActive = activeTab === category.id;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className={`flex flex-col items-center gap-3 p-5 text-sm font-semibold transition-all duration-300 rounded-xl relative group
                      ${isActive 
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 shadow-md transform scale-105' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-102'
                      }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-200 dark:border-blue-700" />
                    )}
                    
                    <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white dark:bg-gray-800 shadow-sm border border-blue-200 dark:border-blue-700' 
                        : 'group-hover:bg-white/50 dark:group-hover:bg-gray-800/50'
                    }`}>
                      <IconComponent className={`w-6 h-6 transition-all duration-300 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'group-hover:scale-110'
                      }`} />
                    </div>
                    
                    <div className="relative z-10 text-center">
                      <span className="hidden sm:inline font-bold">{category.name}</span>
                      <span className="sm:hidden font-bold">{category.shortName}</span>
                    </div>
                    
                    {/* Ripple effect on click */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 translate-x-[-100%] group-active:translate-x-[100%] transition-transform duration-500" />
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {/* Active Tab Description with animated transition */}
            <div className="mt-6 text-center min-h-[2rem] flex items-center justify-center">
              {mainCategories.map((category) => (
                activeTab === category.id && (
                  <div 
                    key={category.id} 
                    className="animate-in slide-in-from-bottom-2 duration-300 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {category.description}
                    </p>
                  </div>
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