
export enum AppMode {
  AUTO_DESIGN = 'AUTO_DESIGN',
  REFERENCE = 'REFERENCE',
  CREATIVE_MANUAL = 'CREATIVE_MANUAL',
  MAGAZINE_ANALYSIS = 'MAGAZINE_ANALYSIS',
  AFFILIATOR = 'AFFILIATOR'
}

export enum Language {
  INDONESIA = 'Indonesian',
  ENGLISH = 'English',
  MANDARIN = 'Mandarin (Simplified)',
  JAPAN = 'Japanese',
  FRENCH = 'French',
  GERMAN = 'German',
  MALAYSIA = 'Malay'
}

export enum DensityLevel {
  MINIMAL = 1,
  LOW = 2,
  BALANCED = 3,
  HIGH = 4,
  MAXIMUM = 5
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export const AspectRatios: AspectRatio[] = ["1:1", "3:4", "4:3", "9:16", "16:9"];

export const PosterStyles = [
  // --- General ---
  "Modern Minimalist",
  "Cyberpunk / Sci-Fi",
  "Retro / Vintage 90s",
  "Luxury / Elegant",
  "Organic / Nature",
  "Bold Typography",
  "Geometric / Bauhaus",
  "Abstract Art",
  "Corporate / Professional",
  "Playful / Kids",
  "Grunge / Street",
  "Neon / Nightlife",
  "Watercolor / Artistic",
  "Paper Cutout / Collage",
  "3D Render / Glossy",
  "Swiss Style / Grid",
  "Art Deco / Classy",
  "Pop Art / Comic",
  "Industrial / Raw",
  "Futuristic / Tech",
  
  // --- Food & Beverage ---
  "Splash Product Visualization",
  "Hyper-Refreshment Look",
  "Modern FMCG Promo Style",
  "Eco Fresh Organic Look",
  "Neo-Cinematic Beverage Aesthetic",
  "Ultra-Realistic Product Liquid CGI",
  "Shadow-Play Modern Product Ads",
  "Stylized 3D Food Art (Pixar-like)",

  // --- Fashion ---
  "Neo-Editorial Minimalism",
  "High-Fashion Cinematic Portrait",
  "Korean Soft Aesthetic",
  "Youth Lifestyle Dynamic Motion",
  "High-Contrast Color Blocking"
] as const;

export const DesignContexts = [
  "Education / Infographic",
  "Health & Wellness",
  "Lifestyle & Fashion",
  "Technology & AI",
  "Social Life / Party",
  "Job & Career",
  "Quotes & Motivation",
  "Business & Marketing",
  "Food & Culinary",
  "Event & Conference",
  "Travel & Adventure",
  "Politics & News"
] as const;

// --- AFFILIATOR MODE PRESETS ---

export const AffiliatorScenes = [
  // Indoor
  "Studio: Futuristic Gamers Setup (Neon, RGB)",
  "Studio: Professional Podcast (Microphone, Acoustic Foam)",
  "Indoor: Minimalist Scandinavian Home (Cozy, White)",
  "Indoor: Luxury Office (Glass, City View)",
  "Indoor: Modern Kitchen (Bright, Marble)",
  "Indoor: Industrial Loft (Brick, Steel)",
  "Indoor: Gym / Fitness Center",
  // Outdoor
  "Outdoor: Urban Street Vibe (Graffiti, Asphalt)",
  "Outdoor: Coffee Shop Terrace (Sunlight, Wooden Tables)",
  "Outdoor: In Front of Trendy Cafe",
  "Outdoor: Rooftop Sunset (Golden Hour)",
  "Outdoor: Tropical Beach (Blue Sky, Sand)",
  "Outdoor: Nature Park (Greenery, Trees)",
  // Aesthetic / Creative
  "Aesthetic: Soil Land with Magma Cracks",
  "Aesthetic: Underwater (Bubbles, Refraction)",
  "Aesthetic: Cloud Heaven (Dreamy, Soft)",
  "Aesthetic: Cyberpunk City Street (Rain, Neon)",
  "Aesthetic: Floral Garden (Blooming Flowers)",
  "Aesthetic: Minimalist Solid Color Studio",
  "Aesthetic: Abstract Geometric 3D Background"
] as const;

export const AffiliatorOutfits = [
  "Auto Generated (Best Match)",
  "Casual: T-Shirt & Jeans",
  "Casual: Oversized Hoodie & Joggers",
  "Smart Casual: Blazer & Chinos",
  "Professional: Business Suit",
  "Professional: Modern Office Wear",
  "Summer: Floral Shirt & Shorts",
  "Summer: Sundress / Beach Wear",
  "Sporty: Gym/Yoga Activewear",
  "Sporty: Runner Gear",
  "Streetwear: Bomber Jacket & Cargo",
  "Fashion: High-End Luxury Coat",
  "Edgy: Leather Jacket & Black Jeans",
  "Cozy: Knitted Sweater",
  "Cultural: Batik / Traditional Modern",
  "Uniform: Medical / Lab Coat",
  "Uniform: Chef / Apron",
  "Party: Cocktail Dress / Evening Wear",
  "Vintage: 90s Retro Style",
  "Futuristic: Techwear"
] as const;

export const AffiliatorPoses = [
  "Auto Generated (Best Match)",
  "Holding product close to face (Smiling)",
  "Holding product out towards camera (POV)",
  "Using the product naturally",
  "Sitting at table, product in front",
  "Standing confidently, product in hand",
  "Pointing at product (Excited)",
  "Looking at product admiringly",
  "Walking while holding product",
  "Selfie style with product",
  "Flat lay (Product only, artistic)",
  "Over the shoulder look",
  "Laughing/Candid interaction",
  "Serious/Professional presentation",
  "Leaning against wall with product",
  "Drinking/Eating (if consumable)",
  "Applying (if cosmetic)",
  "Unboxing gesture",
  "Two hands presenting product",
  "Thumbs up with product"
] as const;


export type PosterStyleType = typeof PosterStyles[number];
export type DesignContextType = typeof DesignContexts[number];

export interface TextSuggestion {
  headline: string;
  subheadline: string; // Used as Subtext 1
  subheadline_2?: string; // New: Subtext 2 (Level 4+)
  body: string; // Used as Body 1
  body_2?: string; // New: Body 2 (Level 5)
  highlights?: string; // New: Key points (Level 3+)
  cta: string;
  tagline: string;
}

export interface MagazineAnalysisResult {
  headline: string;
  subtext_1: string;
  subtext_2: string;
  body: string;
  cta: string;
  visual_style_description: string;
  recreation_prompt: string;
}

export interface ImageBatchResult {
  images: string[];
}
