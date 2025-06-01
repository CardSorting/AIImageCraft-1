/**
 * Scalable Cosplay Style Management System
 * Designed for native mobile app experience with efficient data handling
 */

import { 
  Crown, Star, Wand2, Sparkles, Sword, Shield, Zap, 
  Heart, Music, Palette, Camera, Gamepad2, Headphones,
  Rocket, Atom, Microscope, Stethoscope, Briefcase,
  TreePine, Mountain, Waves, Sun, Moon, CloudRain
} from "lucide-react";

export interface CosplayStyle {
  id: string;
  name: string;
  description: string;
  icon: any;
  popular?: boolean;
  premium?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  prompt: string;
  negativePrompt?: string;
  previewImage?: string;
}

export interface StyleCategory {
  id: string;
  name: string;
  shortName: string; // For mobile tabs
  icon: any;
  description: string;
  styles: CosplayStyle[];
  featured?: boolean;
  color?: string; // Theme color for category
}

// Comprehensive style library with mobile-optimized organization
export const COSPLAY_STYLE_LIBRARY: StyleCategory[] = [
  {
    id: "heroes",
    name: "Superheroes",
    shortName: "Heroes",
    icon: Crown,
    description: "Transform into legendary superheroes and comic book characters",
    color: "blue",
    featured: true,
    styles: [
      {
        id: "marvel-hero",
        name: "Marvel Hero",
        description: "Classic Marvel superhero with cape and emblem",
        icon: Crown,
        popular: true,
        difficulty: "medium",
        tags: ["superhero", "comic", "action"],
        prompt: "a Marvel superhero with cape, costume, and heroic pose, comic book style",
        negativePrompt: "realistic, plain clothes, civilian"
      },
      {
        id: "dc-hero",
        name: "DC Hero",
        description: "Iconic DC Comics superhero style",
        icon: Shield,
        popular: true,
        difficulty: "medium",
        tags: ["superhero", "dc", "comic"],
        prompt: "a DC Comics superhero with iconic costume and symbol, heroic lighting",
        negativePrompt: "villain, dark theme, realistic"
      },
      {
        id: "anti-hero",
        name: "Anti-Hero",
        description: "Dark vigilante with edgy costume",
        icon: Sword,
        difficulty: "hard",
        tags: ["dark", "vigilante", "edgy"],
        prompt: "an anti-hero vigilante with dark costume, mask, and dramatic pose",
        negativePrompt: "bright colors, happy, cheerful"
      }
    ]
  },
  {
    id: "fantasy",
    name: "Fantasy",
    shortName: "Fantasy",
    icon: Wand2,
    description: "Enter magical realms with wizards, knights, and mythical beings",
    color: "purple",
    featured: true,
    styles: [
      {
        id: "wizard",
        name: "Wizard",
        description: "Powerful spellcaster with robes and staff",
        icon: Wand2,
        popular: true,
        difficulty: "medium",
        tags: ["magic", "fantasy", "medieval"],
        prompt: "a fantasy wizard with flowing robes, magical staff, and glowing aura",
        negativePrompt: "modern, technology, realistic"
      },
      {
        id: "knight",
        name: "Knight",
        description: "Noble warrior in shining armor",
        icon: Shield,
        popular: true,
        difficulty: "hard",
        tags: ["armor", "medieval", "warrior"],
        prompt: "a medieval knight in shining armor with sword and shield",
        negativePrompt: "modern, casual, unarmored"
      },
      {
        id: "elf",
        name: "Elf",
        description: "Graceful forest dweller with pointed ears",
        icon: TreePine,
        difficulty: "medium",
        tags: ["elf", "forest", "nature"],
        prompt: "an elegant elf with pointed ears, nature-themed clothing, and ethereal beauty",
        negativePrompt: "human ears, urban, technology"
      }
    ]
  },
  {
    id: "anime",
    name: "Anime",
    shortName: "Anime",
    icon: Sparkles,
    description: "Become your favorite anime and manga characters",
    color: "pink",
    featured: true,
    styles: [
      {
        id: "anime-hero",
        name: "Anime Hero",
        description: "Determined protagonist with spiky hair",
        icon: Sparkles,
        popular: true,
        difficulty: "easy",
        tags: ["anime", "protagonist", "shounen"],
        prompt: "an anime hero with spiky hair, determined expression, and heroic pose, anime art style",
        negativePrompt: "realistic, western cartoon, sad"
      },
      {
        id: "magical-girl",
        name: "Magical Girl",
        description: "Sailor Moon inspired transformation",
        icon: Heart,
        popular: true,
        difficulty: "medium",
        tags: ["magical girl", "sailor moon", "cute"],
        prompt: "a magical girl with colorful outfit, transformation pose, and sparkling effects",
        negativePrompt: "dark theme, realistic, masculine"
      },
      {
        id: "ninja",
        name: "Ninja",
        description: "Stealthy warrior with traditional outfit",
        icon: Sword,
        difficulty: "medium",
        tags: ["ninja", "stealth", "traditional"],
        prompt: "a ninja warrior with mask, traditional outfit, and stealth pose",
        negativePrompt: "visible face, bright colors, modern"
      }
    ]
  },
  {
    id: "scifi",
    name: "Sci-Fi",
    shortName: "Sci-Fi",
    icon: Rocket,
    description: "Explore the future with space officers and cyberpunk aesthetics",
    color: "cyan",
    styles: [
      {
        id: "space-officer",
        name: "Space Officer",
        description: "Futuristic space exploration uniform",
        icon: Rocket,
        popular: true,
        difficulty: "medium",
        tags: ["space", "officer", "uniform"],
        prompt: "a space officer in futuristic uniform with badges and high-tech equipment",
        negativePrompt: "medieval, fantasy, primitive"
      },
      {
        id: "cyberpunk",
        name: "Cyberpunk",
        description: "Neon-lit futuristic street style",
        icon: Zap,
        popular: true,
        difficulty: "hard",
        tags: ["cyberpunk", "neon", "futuristic"],
        prompt: "a cyberpunk character with neon lights, futuristic clothing, and tech accessories",
        negativePrompt: "natural, medieval, bright daylight"
      },
      {
        id: "robot",
        name: "Android",
        description: "Humanoid robot with metallic features",
        icon: Atom,
        difficulty: "hard",
        tags: ["robot", "android", "metallic"],
        prompt: "an android with metallic skin, glowing eyes, and robotic features",
        negativePrompt: "fully human, organic, natural skin"
      }
    ]
  },
  {
    id: "historical",
    name: "Historical",
    shortName: "History",
    icon: Crown,
    description: "Step into different eras and historical periods",
    color: "amber",
    styles: [
      {
        id: "pirate",
        name: "Pirate",
        description: "Swashbuckling sea adventurer",
        icon: Sword,
        popular: true,
        difficulty: "medium",
        tags: ["pirate", "sea", "adventure"],
        prompt: "a pirate captain with hat, coat, and sword, on a ship deck",
        negativePrompt: "modern, landlubber, formal"
      },
      {
        id: "viking",
        name: "Viking",
        description: "Norse warrior with horned helmet",
        icon: Shield,
        difficulty: "medium",
        tags: ["viking", "norse", "warrior"],
        prompt: "a Viking warrior with horned helmet, fur clothing, and battle axe",
        negativePrompt: "modern, peaceful, clean-shaven"
      },
      {
        id: "samurai",
        name: "Samurai",
        description: "Japanese warrior with traditional armor",
        icon: Sword,
        difficulty: "hard",
        tags: ["samurai", "japanese", "warrior"],
        prompt: "a samurai warrior in traditional armor with katana sword, honorable pose",
        negativePrompt: "western, modern, casual"
      }
    ]
  },
  {
    id: "artistic",
    name: "Art Styles",
    shortName: "Art",
    icon: Palette,
    description: "Transform into famous art movements and styles",
    color: "rose",
    styles: [
      {
        id: "renaissance",
        name: "Renaissance",
        description: "Classical European painting style",
        icon: Palette,
        difficulty: "hard",
        tags: ["renaissance", "classical", "painting"],
        prompt: "a Renaissance portrait with classical lighting, noble clothing, and artistic composition",
        negativePrompt: "modern, cartoon, photography"
      },
      {
        id: "pop-art",
        name: "Pop Art",
        description: "Andy Warhol inspired bold colors",
        icon: Camera,
        popular: true,
        difficulty: "medium",
        tags: ["pop art", "bold", "colorful"],
        prompt: "a pop art portrait with bold colors, high contrast, and graphic style",
        negativePrompt: "realistic, muted colors, detailed"
      },
      {
        id: "impressionist",
        name: "Impressionist",
        description: "Soft brushstrokes and light effects",
        icon: Sun,
        difficulty: "medium",
        tags: ["impressionist", "soft", "artistic"],
        prompt: "an impressionist painting with soft brushstrokes, natural lighting, and artistic style",
        negativePrompt: "sharp details, photography, digital"
      }
    ]
  }
];

// Mobile-optimized category navigation
export const getFeaturedCategories = (): StyleCategory[] => {
  return COSPLAY_STYLE_LIBRARY.filter(cat => cat.featured);
};

export const getPopularStyles = (): CosplayStyle[] => {
  return COSPLAY_STYLE_LIBRARY
    .flatMap(cat => cat.styles)
    .filter(style => style.popular)
    .slice(0, 8); // Limit for mobile performance
};

export const getCategoryById = (id: string): StyleCategory | undefined => {
  return COSPLAY_STYLE_LIBRARY.find(cat => cat.id === id);
};

export const getStyleById = (id: string): CosplayStyle | undefined => {
  return COSPLAY_STYLE_LIBRARY
    .flatMap(cat => cat.styles)
    .find(style => style.id === id);
};

export const searchStyles = (query: string): CosplayStyle[] => {
  const searchTerms = query.toLowerCase().split(' ');
  return COSPLAY_STYLE_LIBRARY
    .flatMap(cat => cat.styles)
    .filter(style => 
      searchTerms.every(term =>
        style.name.toLowerCase().includes(term) ||
        style.description.toLowerCase().includes(term) ||
        style.tags?.some(tag => tag.toLowerCase().includes(term))
      )
    );
};

// Mobile performance optimization
export const getCategoryPreview = (categoryId: string, limit: number = 4): CosplayStyle[] => {
  const category = getCategoryById(categoryId);
  return category?.styles.slice(0, limit) || [];
};