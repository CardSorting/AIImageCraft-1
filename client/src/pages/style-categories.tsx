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
  const regularCategories = categories?.filter(cat => !cat.featured) || [];

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
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Featured Categories
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCategories.map((category) => {
                const IconComponent = getIcon(category.iconName);
                return (
                  <Link key={category.id} href={`/style-library/${category.categoryId}`}>
                    <Card className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 bg-white dark:bg-slate-800 border-0 shadow-lg overflow-hidden backdrop-blur-sm">
                      <CardContent className="p-0 relative">
                        <div className={`h-40 bg-gradient-to-br ${getColorClasses(category.color)} flex items-center justify-center relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <IconComponent className="w-16 h-16 text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-semibold">
                              Featured
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="mb-3">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 mb-1">
                              {category.name}
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider font-medium">
                              {category.shortName}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                            {category.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                              <span>Premium Collection</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-1 transition-transform duration-300">
                              <span className="text-sm">Explore</span>
                              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              })}
            </div>
          </div>
        )}

        {/* Other Categories */}
        {regularCategories.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Browse by Category
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {regularCategories.map((category) => {
                const IconComponent = getIcon(category.iconName);
                return (
                  <Link key={category.id} href={`/style-library/${category.categoryId}`}>
                    <Card className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="text-center space-y-3">
                          <div className={`w-12 h-12 mx-auto bg-gradient-to-br ${getColorClasses(category.color)} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm line-clamp-1 mb-1">
                              {category.name}
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider font-medium">
                              {category.shortName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {category.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}