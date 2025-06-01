import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Users, Star, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";

interface StyleCategory {
  id: number;
  categoryId: string;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  featured: boolean;
  color: string;
  styleCount?: number;
}

const iconMap = {
  Crown,
  Star,
  Users,
  Shield: Crown,
  Heart: Star,
  WandSparkles: Star,
  Sparkles: Star,
  Zap: Star,
  Rocket: Star,
  Sword: Crown,
  Camera: Star,
  Palette: Star
};

export default function StyleCategoriesPage() {
  const { data: categories, isLoading } = useQuery<StyleCategory[]>({
    queryKey: ['/api/style-categories'],
    staleTime: 5 * 60 * 1000,
  });

  const featuredCategories = categories?.filter(cat => cat.featured) || [];
  const allCategories = categories || [];

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Star;
    return IconComponent;
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      cyan: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
      gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
      amber: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
      rose: 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700',
      navy: 'from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900',
      gold: 'from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600',
      magenta: 'from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700',
      brown: 'from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900',
    };
    return colorMap[color as keyof typeof colorMap] || 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SEOHead 
        title="Style Categories - AI Cosplay Generator"
        description="Explore our comprehensive collection of style categories from anime and gaming to fashion and pop culture"
      />
      
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/ai-cosplay">
            <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to AI Cosplay
            </button>
          </Link>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Style Library
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Choose a category to explore our curated collection of styles
          </p>
        </div>

        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
              Featured Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCategories.map((category) => {
                const IconComponent = getIcon(category.iconName);
                return (
                  <Link key={category.id} href={`/style-library/${category.categoryId}`}>
                    <Card className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white dark:bg-slate-800 border-0 shadow-lg">
                      <CardContent className="p-0">
                        <div className={`h-32 bg-gradient-to-br ${getColorClasses(category.color)} rounded-t-xl flex items-center justify-center transition-all duration-300`}>
                          <IconComponent className="w-12 h-12 text-white" />
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {category.name}
                            </h3>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              Featured
                            </Badge>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                            {category.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                              {category.shortName}
                            </span>
                            <span className="text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                              Explore →
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* All Categories */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            All Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allCategories.map((category) => {
              const IconComponent = getIcon(category.iconName);
              return (
                <Link key={category.id} href={`/style-library/${category.categoryId}`}>
                  <Card className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getColorClasses(category.color)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                            {category.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                            {category.shortName}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}