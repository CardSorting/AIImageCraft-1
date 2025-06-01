/**
 * Style Library Page
 * Dedicated page for browsing and discovering cosplay styles
 * Following Apple's Design System principles
 */

import { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Search, Filter, Grid, List, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SEOHead } from "@/components/SEOHead";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { StyleLibraryAdapter } from "@/infrastructure/adapters/StyleLibraryAdapter";
import { StyleLibraryQueryHandler } from "@/application/queries/StyleLibraryQueries";
import { StyleSelectionCommandHandler } from "@/application/commands/StyleSelectionCommands";
import { StyleCategoryGrid } from "@/components/style-library/StyleCategoryGrid";
import { StyleDetailView } from "@/components/style-library/StyleDetailView";
import { StyleSearchResults } from "@/components/style-library/StyleSearchResults";
import { FeaturedStylesCarousel } from "@/components/style-library/FeaturedStylesCarousel";

export default function StyleLibraryPage() {
  const { categoryId, styleId } = useParams<{ categoryId?: string; styleId?: string }>();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialize services
  const styleLibrary = useMemo(() => StyleLibraryAdapter.getInstance().getStyleLibrary(), []);
  const queryHandler = useMemo(() => new StyleLibraryQueryHandler(styleLibrary), [styleLibrary]);
  const commandHandler = useMemo(() => new StyleSelectionCommandHandler(), []);

  // Determine current view state
  const currentCategory = useMemo(() => {
    if (!categoryId) return null;
    return queryHandler.handle({
      type: 'GET_CATEGORY_BY_ID',
      categoryId
    });
  }, [categoryId, queryHandler]);

  const currentStyle = useMemo(() => {
    if (!styleId) return null;
    return queryHandler.handle({
      type: 'GET_STYLE_BY_ID',
      styleId
    });
  }, [styleId, queryHandler]);

  const featuredCategories = useMemo(() => {
    return queryHandler.handle({
      type: 'GET_FEATURED_CATEGORIES',
      limit: 6
    });
  }, [queryHandler]);

  const popularStyles = useMemo(() => {
    return queryHandler.handle({
      type: 'GET_POPULAR_STYLES',
      limit: 8
    });
  }, [queryHandler]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return queryHandler.handle({
      type: 'SEARCH_STYLES',
      query: searchQuery,
      categoryId: categoryId,
      limit: 20
    });
  }, [searchQuery, categoryId, queryHandler]);

  // Handle style selection
  const handleStyleSelect = async (selectedStyleId: string) => {
    await commandHandler.handle({
      type: 'SELECT_STYLE',
      styleId: selectedStyleId,
      timestamp: new Date()
    });
    
    navigate(`/ai-cosplay?style=${selectedStyleId}`);
  };

  // Handle navigation
  const handleCategorySelect = (selectedCategoryId: string) => {
    navigate(`/style-library/${selectedCategoryId}`);
  };

  const handleBackNavigation = () => {
    if (styleId && categoryId) {
      navigate(`/style-library/${categoryId}`);
    } else if (categoryId) {
      navigate('/style-library');
    } else {
      navigate('/ai-cosplay');
    }
  };

  // SEO metadata
  const pageTitle = currentStyle 
    ? `${currentStyle.metadata.name} - Style Library`
    : currentCategory 
    ? `${currentCategory.metadata.name} Styles - Library`
    : 'Style Library - Discover Cosplay Styles';

  const pageDescription = currentStyle
    ? `Transform into ${currentStyle.metadata.name}. ${currentStyle.metadata.description}`
    : currentCategory
    ? `Explore ${currentCategory.metadata.name} cosplay styles. ${currentCategory.metadata.description}`
    : 'Discover thousands of cosplay styles from movies, TV shows, anime, and more. Find the perfect character transformation.';

  return (
    <>
      <SEOHead 
        title={pageTitle}
        description={pageDescription}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
        <NavigationHeader />
        
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {(categoryId || styleId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackNavigation}
                  className="p-2 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentCategory ? currentCategory.metadata.name : 'Style Library'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {currentCategory 
                    ? `${currentCategory.getStyleCount()} available styles`
                    : 'Discover your perfect cosplay transformation'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2 rounded-xl"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search styles, characters, or themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 rounded-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Content based on current view */}
          {currentStyle ? (
            <StyleDetailView 
              style={currentStyle}
              onSelect={handleStyleSelect}
              onBack={handleBackNavigation}
            />
          ) : searchQuery ? (
            <StyleSearchResults
              results={searchResults}
              query={searchQuery}
              viewMode={viewMode}
              onStyleSelect={handleStyleSelect}
            />
          ) : currentCategory ? (
            <StyleCategoryGrid
              category={currentCategory}
              viewMode={viewMode}
              onStyleSelect={handleStyleSelect}
            />
          ) : (
            <div className="space-y-8">
              {/* Featured Styles Carousel */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold">Featured Styles</h2>
                </div>
                <FeaturedStylesCarousel
                  styles={popularStyles}
                  onStyleSelect={handleStyleSelect}
                />
              </section>

              {/* Category Grid */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featuredCategories.map(category => (
                    <Card
                      key={category.id.value}
                      className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                      onClick={() => handleCategorySelect(category.id.value)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-xl">
                              {category.iconName === 'Crown' ? '👑' : '⭐'}
                            </span>
                          </div>
                          <h3 className="font-medium text-sm mb-1">{category.metadata.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {category.getStyleCount()} styles
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}