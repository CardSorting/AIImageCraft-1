/**
 * Style Library Data Adapter
 * Bridges legacy cosplay styles data with new domain architecture
 * Follows Apple's seamless migration approach
 */

import { 
  StyleLibrary, 
  StyleCategory, 
  CosplayStyle,
  StyleId,
  CategoryId,
  StyleMetadata,
  CategoryMetadata,
  StylePrompt,
  StyleVisuals
} from '@/domain/entities/StyleLibrary';
import { 
  COSPLAY_STYLE_LIBRARY,
  type CosplayStyle as LegacyCosplayStyle,
  type StyleCategory as LegacyStyleCategory
} from '@shared/cosplayStyles';

export class StyleLibraryAdapter {
  private static instance: StyleLibraryAdapter;
  private styleLibrary: StyleLibrary | null = null;

  private constructor() {}

  public static getInstance(): StyleLibraryAdapter {
    if (!StyleLibraryAdapter.instance) {
      StyleLibraryAdapter.instance = new StyleLibraryAdapter();
    }
    return StyleLibraryAdapter.instance;
  }

  public getStyleLibrary(): StyleLibrary {
    if (!this.styleLibrary) {
      this.styleLibrary = this.createStyleLibraryFromLegacyData();
    }
    return this.styleLibrary;
  }

  private createStyleLibraryFromLegacyData(): StyleLibrary {
    const categories = COSPLAY_STYLE_LIBRARY.map(legacyCategory => 
      this.adaptLegacyCategory(legacyCategory)
    );
    
    return new StyleLibrary(categories);
  }

  private adaptLegacyCategory(legacyCategory: LegacyStyleCategory): StyleCategory {
    const categoryId: CategoryId = { value: legacyCategory.id };
    
    const metadata: CategoryMetadata = {
      name: legacyCategory.name,
      shortName: legacyCategory.shortName,
      description: legacyCategory.description,
      featured: legacyCategory.featured || false,
      color: legacyCategory.color
    };

    const styles = legacyCategory.styles.map(legacyStyle => 
      this.adaptLegacyStyle(legacyStyle)
    );

    return new StyleCategory(
      categoryId,
      metadata,
      this.getIconName(legacyCategory.icon),
      styles
    );
  }

  private adaptLegacyStyle(legacyStyle: LegacyCosplayStyle): CosplayStyle {
    const styleId: StyleId = { value: legacyStyle.id };
    
    const metadata: StyleMetadata = {
      name: legacyStyle.name,
      description: legacyStyle.description,
      tags: legacyStyle.tags || [],
      difficulty: legacyStyle.difficulty || 'medium',
      premium: legacyStyle.premium || false,
      popularity: legacyStyle.popular ? 0.9 : Math.random() * 0.7 + 0.1
    };

    const prompt: StylePrompt = {
      positive: legacyStyle.prompt,
      negative: legacyStyle.negativePrompt
    };

    const visuals: StyleVisuals = {
      iconName: this.getIconName(legacyStyle.icon),
      previewImage: legacyStyle.previewImage,
      color: undefined
    };

    return new CosplayStyle(styleId, metadata, prompt, visuals);
  }

  private getIconName(iconComponent: any): string {
    // Extract icon name from Lucide React component
    if (iconComponent && iconComponent.displayName) {
      return iconComponent.displayName;
    }
    
    // Fallback mapping for common icons
    const iconString = iconComponent?.toString() || '';
    if (iconString.includes('Crown')) return 'Crown';
    if (iconString.includes('Star')) return 'Star';
    if (iconString.includes('Wand')) return 'Wand2';
    if (iconString.includes('Sparkles')) return 'Sparkles';
    if (iconString.includes('Sword')) return 'Sword';
    if (iconString.includes('Shield')) return 'Shield';
    if (iconString.includes('Zap')) return 'Zap';
    if (iconString.includes('Heart')) return 'Heart';
    if (iconString.includes('Music')) return 'Music';
    if (iconString.includes('Palette')) return 'Palette';
    if (iconString.includes('Camera')) return 'Camera';
    if (iconString.includes('Gamepad')) return 'Gamepad2';
    if (iconString.includes('Headphones')) return 'Headphones';
    if (iconString.includes('Rocket')) return 'Rocket';
    if (iconString.includes('Atom')) return 'Atom';
    if (iconString.includes('Microscope')) return 'Microscope';
    if (iconString.includes('Stethoscope')) return 'Stethoscope';
    if (iconString.includes('Briefcase')) return 'Briefcase';
    if (iconString.includes('TreePine')) return 'TreePine';
    if (iconString.includes('Mountain')) return 'Mountain';
    if (iconString.includes('Waves')) return 'Waves';
    if (iconString.includes('Sun')) return 'Sun';
    if (iconString.includes('Moon')) return 'Moon';
    if (iconString.includes('CloudRain')) return 'CloudRain';
    
    return 'Star'; // Default fallback
  }

  public preloadPopularStyles(): void {
    const library = this.getStyleLibrary();
    library.getPopularStyles(20);
  }

  public invalidateCache(): void {
    this.styleLibrary = null;
  }
}