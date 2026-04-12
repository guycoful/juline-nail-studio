// ===== Types =====

export interface NailShape {
  id: string;
  nameHe: string;
  nameEn: string;
  path: string; // SVG path for viewBox "0 0 60 90"
}

export interface ColorOption {
  id: string;
  nameHe: string;
  nameEn: string;
  hex: string;
}

export interface DesignOption {
  id: string;
  nameHe: string;
  nameEn: string;
  icon: string;
}

export interface LengthOption {
  id: string;
  nameHe: string;
  nameEn: string;
  icon: string;
}

export interface NailDesign {
  shape: string;
  length: string;
  baseColor: string;
  secondaryColor: string;
  accentFingers: number[]; // finger indices: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
  designElements: string[];
  style: string;
  accents: string[];
  finish: string;
  notes: string;
}

export const DEFAULT_DESIGN: NailDesign = {
  shape: '',
  length: '',
  baseColor: '',
  secondaryColor: '',
  accentFingers: [3], // ring finger by default
  designElements: [],
  style: '',
  accents: [],
  finish: '',
  notes: '',
};

export const FINGER_NAMES_HE = ['אגודל', 'אצבע', 'אמה', 'קמיצה', 'זרת'];

// ===== Steps =====

export const STEPS = [
  { id: 0, nameHe: 'צורה', nameEn: 'Shape' },
  { id: 1, nameHe: 'אורך', nameEn: 'Length' },
  { id: 2, nameHe: 'צבע בסיס', nameEn: 'Base Color' },
  { id: 3, nameHe: 'עיצוב', nameEn: 'Design' },
  { id: 4, nameHe: 'סגנון', nameEn: 'Style' },
  { id: 5, nameHe: 'הדגשות', nameEn: 'Accents' },
  { id: 6, nameHe: 'פיניש', nameEn: 'Finish' },
  { id: 7, nameHe: 'סיכום', nameEn: 'Summary' },
];

// ===== Nail Shapes (SVG paths, viewBox 0 0 60 90) =====

export const nailShapes: NailShape[] = [
  {
    id: 'almond',
    nameHe: 'שקד',
    nameEn: 'Almond',
    path: 'M 0 90 L 0 45 C 0 18 12 0 30 0 C 48 0 60 18 60 45 L 60 90 Z',
  },
  {
    id: 'oval',
    nameHe: 'אובלי',
    nameEn: 'Oval',
    path: 'M 0 90 L 0 30 C 0 10 10 0 30 0 C 50 0 60 10 60 30 L 60 90 Z',
  },
  {
    id: 'square',
    nameHe: 'מרובע',
    nameEn: 'Square',
    path: 'M 0 90 L 0 6 Q 0 0 6 0 L 54 0 Q 60 0 60 6 L 60 90 Z',
  },
  {
    id: 'coffin',
    nameHe: 'בלרינה',
    nameEn: 'Ballerina',
    path: 'M 0 90 L 5 45 L 13 18 L 18 5 Q 18 0 23 0 L 37 0 Q 42 0 42 5 L 47 18 L 55 45 L 60 90 Z',
  },
  {
    id: 'stiletto',
    nameHe: 'סטילטו',
    nameEn: 'Stiletto',
    path: 'M 0 90 L 2 55 C 2 22 16 0 30 0 C 44 0 58 22 58 55 L 60 90 Z',
  },
  {
    id: 'short-natural',
    nameHe: 'טבעי קצר',
    nameEn: 'Short Natural',
    path: 'M 0 90 L 0 18 C 0 6 10 0 30 0 C 50 0 60 6 60 18 L 60 90 Z',
  },
];

// ===== Nail Lengths =====

export const nailLengths: LengthOption[] = [
  { id: 'natural', nameHe: 'טבעי', nameEn: 'Natural short length', icon: '🤏' },
  { id: 'medium', nameHe: 'בינוני', nameEn: 'Medium length', icon: '✋' },
  { id: 'long', nameHe: 'ארוך', nameEn: 'Long length', icon: '💅' },
  { id: 'extra-long', nameHe: 'אקסטרה אורך', nameEn: 'Extra long length', icon: '✨' },
];

// ===== Base Colors (20) =====

export const baseColors: ColorOption[] = [
  // --- אדומים ---
  { id: 'classic-red', nameHe: 'אדום קלאסי', nameEn: 'Classic Red', hex: '#CC0000' },
  { id: 'cherry', nameHe: 'דובדבן', nameEn: 'Cherry', hex: '#9B111E' },
  { id: 'wine', nameHe: 'יין', nameEn: 'Wine', hex: '#722F37' },
  { id: 'scarlet', nameHe: 'שני', nameEn: 'Scarlet', hex: '#FF2400' },
  { id: 'brick-red', nameHe: 'אדום לבנה', nameEn: 'Brick Red', hex: '#CB4154' },
  { id: 'cranberry', nameHe: 'חמוציות', nameEn: 'Cranberry', hex: '#9B1B30' },
  { id: 'blood-red', nameHe: 'אדום עמוק', nameEn: 'Deep Red', hex: '#8B0000' },
  // --- ורודים ---
  { id: 'hot-pink', nameHe: 'ורוד חם', nameEn: 'Hot Pink', hex: '#FF69B4' },
  { id: 'baby-pink', nameHe: 'ורוד בייבי', nameEn: 'Baby Pink', hex: '#F4C2C2' },
  { id: 'rose', nameHe: 'ורד', nameEn: 'Rose', hex: '#E8ADAA' },
  { id: 'dusty-rose', nameHe: 'ורוד מאובק', nameEn: 'Dusty Rose', hex: '#C48A8A' },
  { id: 'blush', nameHe: 'סומק', nameEn: 'Blush', hex: '#DE5D83' },
  { id: 'bubblegum', nameHe: 'מסטיק', nameEn: 'Bubblegum Pink', hex: '#FFC1CC' },
  { id: 'fuchsia', nameHe: 'פוקסיה', nameEn: 'Fuchsia', hex: '#FF00FF' },
  { id: 'magenta', nameHe: 'מג\'נטה', nameEn: 'Magenta', hex: '#FF0090' },
  { id: 'salmon', nameHe: 'סלמון', nameEn: 'Salmon Pink', hex: '#FA8072' },
  { id: 'mauve', nameHe: 'מוב', nameEn: 'Mauve', hex: '#E0B0FF' },
  { id: 'raspberry', nameHe: 'פטל', nameEn: 'Raspberry', hex: '#E30B5C' },
  // --- נוד ובז' ---
  { id: 'nude-pink', nameHe: 'נוד ורוד', nameEn: 'Nude Pink', hex: '#E8C4B8' },
  { id: 'nude-beige', nameHe: 'נוד בז\'', nameEn: 'Nude Beige', hex: '#D9B99B' },
  { id: 'nude-caramel', nameHe: 'נוד קרמל', nameEn: 'Nude Caramel', hex: '#C68E6A' },
  { id: 'nude-peach', nameHe: 'נוד אפרסק', nameEn: 'Nude Peach', hex: '#FFDAB9' },
  { id: 'nude-mocha', nameHe: 'נוד מוקה', nameEn: 'Nude Mocha', hex: '#B89078' },
  { id: 'nude-almond', nameHe: 'נוד שקד', nameEn: 'Nude Almond', hex: '#EFDECD' },
  { id: 'nude-tan', nameHe: 'נוד חום בהיר', nameEn: 'Nude Tan', hex: '#D2B48C' },
  { id: 'nude-cocoa', nameHe: 'נוד קקאו', nameEn: 'Nude Cocoa', hex: '#A0785A' },
  // --- לבנים ושמנת ---
  { id: 'french-white', nameHe: 'לבן פרנצ\'', nameEn: 'French White', hex: '#FFFAF0' },
  { id: 'milky', nameHe: 'חלבי', nameEn: 'Milky White', hex: '#FEF9F0' },
  { id: 'champagne', nameHe: 'שמפניה', nameEn: 'Champagne', hex: '#F7E7CE' },
  { id: 'ivory', nameHe: 'שנהב', nameEn: 'Ivory', hex: '#FFFFF0' },
  { id: 'pearl-white', nameHe: 'לבן פנינה', nameEn: 'Pearl White', hex: '#F0EAD6' },
  { id: 'vanilla', nameHe: 'וניל', nameEn: 'Vanilla', hex: '#F3E5AB' },
  // --- סגולים ---
  { id: 'lavender', nameHe: 'לבנדר', nameEn: 'Lavender', hex: '#B57EDC' },
  { id: 'dark-plum', nameHe: 'שזיף כהה', nameEn: 'Dark Plum', hex: '#4E2A84' },
  { id: 'lilac', nameHe: 'לילך', nameEn: 'Lilac', hex: '#C8A2C8' },
  { id: 'grape', nameHe: 'ענבים', nameEn: 'Grape', hex: '#6F2DA8' },
  { id: 'orchid', nameHe: 'סחלב', nameEn: 'Orchid', hex: '#DA70D6' },
  { id: 'violet', nameHe: 'סגול', nameEn: 'Violet', hex: '#7F00FF' },
  { id: 'eggplant', nameHe: 'חציל', nameEn: 'Eggplant', hex: '#614051' },
  // --- כחולים ---
  { id: 'baby-blue', nameHe: 'תכלת בייבי', nameEn: 'Baby Blue', hex: '#89CFF0' },
  { id: 'navy', nameHe: 'כחול כהה', nameEn: 'Navy', hex: '#1B2A4A' },
  { id: 'royal-blue', nameHe: 'כחול רויאל', nameEn: 'Royal Blue', hex: '#4169E1' },
  { id: 'sky-blue', nameHe: 'תכלת שמיים', nameEn: 'Sky Blue', hex: '#87CEEB' },
  { id: 'ocean', nameHe: 'אוקיינוס', nameEn: 'Ocean Blue', hex: '#006994' },
  { id: 'cobalt', nameHe: 'קובלט', nameEn: 'Cobalt', hex: '#0047AB' },
  { id: 'teal', nameHe: 'טיל', nameEn: 'Teal', hex: '#008080' },
  // --- ירוקים ---
  { id: 'mint', nameHe: 'מנטה', nameEn: 'Mint', hex: '#98D4A2' },
  { id: 'sage-green', nameHe: 'ירוק מרווה', nameEn: 'Sage Green', hex: '#9CAF88' },
  { id: 'olive', nameHe: 'זית', nameEn: 'Olive Green', hex: '#808000' },
  { id: 'emerald', nameHe: 'אמרלד', nameEn: 'Emerald', hex: '#50C878' },
  { id: 'forest', nameHe: 'ירוק יער', nameEn: 'Forest Green', hex: '#228B22' },
  { id: 'pistachio', nameHe: 'פיסטוק', nameEn: 'Pistachio', hex: '#93C572' },
  // --- חומים וארציים ---
  { id: 'terracotta', nameHe: 'טרקוטה', nameEn: 'Terracotta', hex: '#CC6A4C' },
  { id: 'chocolate', nameHe: 'שוקולד', nameEn: 'Chocolate', hex: '#7B3F00' },
  { id: 'coffee', nameHe: 'קפה', nameEn: 'Coffee', hex: '#6F4E37' },
  { id: 'cinnamon', nameHe: 'קינמון', nameEn: 'Cinnamon', hex: '#D2691E' },
  { id: 'camel', nameHe: 'גמל', nameEn: 'Camel', hex: '#C19A6B' },
  { id: 'rust', nameHe: 'חלודה', nameEn: 'Rust', hex: '#B7410E' },
  // --- כהים ומטאליים ---
  { id: 'black', nameHe: 'שחור', nameEn: 'Black', hex: '#1A1A1A' },
  { id: 'charcoal', nameHe: 'פחם', nameEn: 'Charcoal', hex: '#36454F' },
  { id: 'gunmetal', nameHe: 'אפור מטאלי', nameEn: 'Gunmetal', hex: '#53565A' },
  { id: 'gold', nameHe: 'זהב', nameEn: 'Gold', hex: '#FFD700' },
  { id: 'rose-gold', nameHe: 'רוז גולד', nameEn: 'Rose Gold', hex: '#B76E79' },
  { id: 'silver', nameHe: 'כסף', nameEn: 'Silver', hex: '#C0C0C0' },
  { id: 'bronze', nameHe: 'ברונזה', nameEn: 'Bronze', hex: '#CD7F32' },
  { id: 'copper', nameHe: 'נחושת', nameEn: 'Copper', hex: '#B87333' },
  // --- כתומים ---
  { id: 'coral', nameHe: 'קורל', nameEn: 'Coral', hex: '#FF7F50' },
  { id: 'peach', nameHe: 'אפרסק', nameEn: 'Peach', hex: '#FFCBA4' },
  { id: 'tangerine', nameHe: 'קלמנטינה', nameEn: 'Tangerine', hex: '#FF9966' },
  { id: 'burnt-orange', nameHe: 'כתום שרוף', nameEn: 'Burnt Orange', hex: '#CC5500' },
  { id: 'apricot', nameHe: 'משמש', nameEn: 'Apricot', hex: '#FBCEB1' },
];

// ===== Design Elements (20) =====

export const designElements: DesignOption[] = [
  { id: 'french-tip', nameHe: "פרנצ'", nameEn: 'French tip', icon: '🇫🇷' },
  { id: 'baby-french', nameHe: "בייבי פרנצ'", nameEn: 'Baby French tip', icon: '🤍' },
  { id: 'v-french', nameHe: "V פרנצ'", nameEn: 'V-shaped French tip', icon: '✌️' },
  { id: 'colored-french', nameHe: "פרנצ' צבעוני", nameEn: 'Colored French tip', icon: '🌈' },
  { id: 'double-french', nameHe: "דאבל פרנצ'", nameEn: 'Double French tip', icon: '✨' },
  { id: 'flowers', nameHe: 'פרחים', nameEn: 'Floral art', icon: '🌸' },
  { id: 'tiny-flowers', nameHe: 'פרחים זעירים', nameEn: 'Tiny delicate flowers', icon: '🌼' },
  { id: 'roses', nameHe: 'ורדים', nameEn: 'Rose art', icon: '🌹' },
  { id: 'marble', nameHe: 'שיש', nameEn: 'Marble effect', icon: '🪨' },
  { id: 'ombre', nameHe: 'אומברה', nameEn: 'Ombre gradient', icon: '🎨' },
  { id: 'geometric', nameHe: 'גאומטרי', nameEn: 'Geometric patterns', icon: '🔷' },
  { id: 'abstract', nameHe: 'אבסטרקט', nameEn: 'Abstract art', icon: '🌀' },
  { id: 'animal-print', nameHe: 'הדפס חיות', nameEn: 'Animal print', icon: '🐆' },
  { id: 'cow-print', nameHe: 'הדפס פרה', nameEn: 'Cow print', icon: '🐄' },
  { id: 'snake-print', nameHe: 'הדפס נחש', nameEn: 'Snake skin print', icon: '🐍' },
  { id: 'stars', nameHe: 'כוכבים', nameEn: 'Stars', icon: '⭐' },
  { id: 'hearts', nameHe: 'לבבות', nameEn: 'Hearts', icon: '💕' },
  { id: 'waves', nameHe: 'גלים', nameEn: 'Waves', icon: '🌊' },
  { id: 'leaves', nameHe: 'עלים', nameEn: 'Leaves and botanicals', icon: '🌿' },
  { id: 'butterflies', nameHe: 'פרפרים', nameEn: 'Butterflies', icon: '🦋' },
  { id: 'dots', nameHe: 'נקודות', nameEn: 'Polka dots', icon: '⚪' },
  { id: 'stripes', nameHe: 'פסים', nameEn: 'Stripes', icon: '📏' },
  { id: 'lace', nameHe: 'תחרה', nameEn: 'Lace pattern', icon: '🪡' },
  { id: 'swirls', nameHe: 'ספירלות', nameEn: 'Swirls', icon: '💫' },
  { id: '3d-art', nameHe: 'תלת-מימד', nameEn: '3D nail art elements', icon: '💎' },
  { id: 'watercolor', nameHe: 'צבעי מים', nameEn: 'Watercolor effect', icon: '💧' },
  { id: 'checkerboard', nameHe: 'שחמט', nameEn: 'Checkerboard pattern', icon: '♟️' },
  { id: 'chrome-nails', nameHe: 'כרום', nameEn: 'Chrome nail design', icon: '🪞' },
  { id: 'flame', nameHe: 'להבות', nameEn: 'Flame design', icon: '🔥' },
  { id: 'cloud', nameHe: 'עננים', nameEn: 'Cloud design', icon: '☁️' },
  { id: 'eye-art', nameHe: 'עיניים', nameEn: 'Evil eye art', icon: '🧿' },
  { id: 'moon-stars', nameHe: 'ירח וכוכבים', nameEn: 'Moon and stars', icon: '🌙' },
  { id: 'fruit', nameHe: 'פירות', nameEn: 'Fruit art', icon: '🍓' },
  { id: 'tie-dye', nameHe: 'טאי דאי', nameEn: 'Tie dye', icon: '🎨' },
  { id: 'tortoise-shell', nameHe: 'צב', nameEn: 'Tortoise shell', icon: '🐢' },
  { id: 'galaxy', nameHe: 'גלקסי', nameEn: 'Galaxy nebula', icon: '🌌' },
  { id: 'gradient-tips', nameHe: 'קצוות גרדיאנט', nameEn: 'Gradient tips', icon: '🎆' },
  { id: 'line-art', nameHe: 'קווים', nameEn: 'Line art', icon: '〰️' },
  { id: 'foliage', nameHe: 'צמחיה טרופית', nameEn: 'Tropical foliage', icon: '🌴' },
  { id: 'snowflakes', nameHe: 'פתיתי שלג', nameEn: 'Snowflakes', icon: '❄️' },
  { id: 'drip', nameHe: 'טפטוף', nameEn: 'Drip design', icon: '🫠' },
];

// ===== Styles (20) =====

export const styles: DesignOption[] = [
  { id: 'minimalist', nameHe: 'מינימליסטי', nameEn: 'Minimalist', icon: '✨' },
  { id: 'glamour', nameHe: 'גלאם', nameEn: 'Glamour', icon: '💎' },
  { id: 'romantic', nameHe: 'רומנטי', nameEn: 'Romantic', icon: '🌹' },
  { id: 'edgy', nameHe: 'אדג\'י', nameEn: 'Edgy', icon: '⚡' },
  { id: 'classic', nameHe: 'קלאסי', nameEn: 'Classic elegant', icon: '👑' },
  { id: 'boho', nameHe: 'בוהו', nameEn: 'Boho', icon: '🌻' },
  { id: 'art-deco', nameHe: 'ארט דקו', nameEn: 'Art Deco', icon: '🏛️' },
  { id: 'y2k', nameHe: 'Y2K', nameEn: 'Y2K retro', icon: '🦄' },
  { id: 'clean-girl', nameHe: 'קלין גירל', nameEn: 'Clean girl', icon: '🤍' },
  { id: 'soft-glam', nameHe: 'סופט גלאם', nameEn: 'Soft glam', icon: '🌸' },
  { id: 'vintage', nameHe: 'וינטאג\'', nameEn: 'Vintage', icon: '🕰️' },
  { id: 'coastal', nameHe: 'חופי', nameEn: 'Coastal', icon: '🐚' },
  { id: 'fairycore', nameHe: 'פיירי', nameEn: 'Fairycore', icon: '🧚' },
  { id: 'coquette', nameHe: 'קוקט', nameEn: 'Coquette', icon: '🎀' },
  { id: 'gothic', nameHe: 'גותי', nameEn: 'Gothic', icon: '🖤' },
  { id: 'bridal', nameHe: 'כלתי', nameEn: 'Bridal', icon: '💒' },
  { id: 'festival', nameHe: 'פסטיבלי', nameEn: 'Festival', icon: '🎪' },
  { id: 'korean', nameHe: 'קוריאני', nameEn: 'Korean style', icon: '🇰🇷' },
  { id: 'luxe', nameHe: 'לוקס', nameEn: 'Luxe', icon: '✨' },
  { id: 'playful', nameHe: 'שובב', nameEn: 'Playful', icon: '🎈' },
];

// ===== Accent Details (20) =====

export const accents: DesignOption[] = [
  { id: 'glitter', nameHe: 'גליטר', nameEn: 'Glitter', icon: '✨' },
  { id: 'rhinestones', nameHe: 'אבני חן', nameEn: 'Rhinestones', icon: '💎' },
  { id: 'gold-foil', nameHe: 'פויל זהב', nameEn: 'Gold foil', icon: '🥇' },
  { id: 'silver-foil', nameHe: 'פויל כסף', nameEn: 'Silver foil', icon: '🥈' },
  { id: 'chrome-flakes', nameHe: 'כרום', nameEn: 'Chrome flakes', icon: '🪞' },
  { id: 'pearls', nameHe: 'פנינים', nameEn: 'Pearl accents', icon: '🫧' },
  { id: 'cat-eye', nameHe: 'עין חתול', nameEn: 'Cat eye magnetic', icon: '🐱' },
  { id: 'aurora', nameHe: 'אורורה', nameEn: 'Aurora effect', icon: '🌌' },
  { id: 'holographic', nameHe: 'הולוגרפי', nameEn: 'Holographic', icon: '🌈' },
  { id: 'opal-flakes', nameHe: 'אופל', nameEn: 'Opal flakes', icon: '🔮' },
  { id: 'velvet-powder', nameHe: 'קטיפה', nameEn: 'Velvet powder', icon: '🧸' },
  { id: 'metallic-tips', nameHe: 'קצוות מטאליים', nameEn: 'Metallic tips', icon: '⚙️' },
  { id: 'micro-beads', nameHe: 'חרוזים זעירים', nameEn: 'Micro beads caviar', icon: '🫧' },
  { id: 'charm', nameHe: 'צ\'ארם', nameEn: 'Nail charms', icon: '🧿' },
  { id: 'thread-art', nameHe: 'חוטים', nameEn: 'Thread art', icon: '🧵' },
  { id: 'stickers', nameHe: 'מדבקות', nameEn: 'Nail stickers', icon: '🏷️' },
  { id: 'none', nameHe: 'ללא', nameEn: 'No accents', icon: '➖' },
];

// ===== Finishes (20) =====

export const finishes: DesignOption[] = [
  { id: 'glossy', nameHe: 'מבריק', nameEn: 'High gloss', icon: '✨' },
  { id: 'matte', nameHe: 'מאט', nameEn: 'Matte', icon: '🌑' },
  { id: 'semi-matte', nameHe: 'חצי מאט', nameEn: 'Semi-matte satin', icon: '🌓' },
  { id: 'chrome', nameHe: 'כרום', nameEn: 'Chrome mirror', icon: '🪞' },
  { id: 'mirror', nameHe: 'מראה', nameEn: 'Full mirror', icon: '💿' },
  { id: 'velvet', nameHe: 'קטיפה', nameEn: 'Velvet texture', icon: '🧶' },
  { id: 'satin', nameHe: 'סאטן', nameEn: 'Satin', icon: '🎀' },
  { id: 'shimmer', nameHe: 'שימר', nameEn: 'Shimmer', icon: '🌟' },
  { id: 'glitter-top', nameHe: 'טופ גליטר', nameEn: 'Glitter topcoat', icon: '💫' },
  { id: 'sugar-texture', nameHe: 'טקסטורת סוכר', nameEn: 'Sugar texture finish', icon: '🍬' },
  { id: 'magnetic', nameHe: 'מגנטי', nameEn: 'Magnetic cat-eye', icon: '🧲' },
  { id: 'holo', nameHe: 'הולו', nameEn: 'Holographic', icon: '🌈' },
  { id: 'aurora-finish', nameHe: 'אורורה', nameEn: 'Aurora finish', icon: '🌌' },
  { id: 'glass', nameHe: 'זכוכית', nameEn: 'Glass finish', icon: '🥂' },
  { id: 'jelly', nameHe: 'ג\'לי', nameEn: 'Jelly transparent', icon: '🍭' },
  { id: 'metallic', nameHe: 'מטאלי', nameEn: 'Metallic', icon: '⚙️' },
  { id: 'ice', nameHe: 'קרח', nameEn: 'Ice crystal', icon: '❄️' },
  { id: 'dewy', nameHe: 'טללים', nameEn: 'Dewy fresh', icon: '💧' },
  { id: 'clear-gel', nameHe: 'ג\'ל שקוף', nameEn: 'Clear gel', icon: '💠' },
];

// ===== Utility Functions =====

export function buildPrompt(design: NailDesign): string {
  const shape = nailShapes.find(s => s.id === design.shape);
  const length = nailLengths.find(l => l.id === design.length);
  const color = resolveColor(design.baseColor);
  const elements = design.designElements
    .map(id => designElements.find(e => e.id === id))
    .filter(Boolean);
  const style = styles.find(s => s.id === design.style);
  const accentItems = design.accents
    .map(id => accents.find(a => a.id === id))
    .filter(Boolean);
  const finish = finishes.find(f => f.id === design.finish);

  // Structured prompt optimized for photorealistic nail photography
  const parts: string[] = [
    'Professional nail salon editorial photograph. Close-up of one elegant female hand showing all five fingers with perfectly manicured',
  ];

  if (length) parts.push(`${length.nameEn},`);
  if (shape) parts.push(`${shape.nameEn} shaped`);
  parts.push('gel nail extensions.');

  const secondaryColor = resolveColor(design.secondaryColor);

  if (color && secondaryColor) {
    const accentCount = design.accentFingers.length;
    parts.push(`${5 - accentCount} nails in ${color.nameEn} gel polish and ${accentCount} accent nail${accentCount > 1 ? 's' : ''} in ${secondaryColor.nameEn} gel polish, all with full even coverage from cuticle to free edge.`);
  } else if (color) {
    parts.push(`Full even coverage of ${color.nameEn} gel polish on every nail from cuticle to free edge.`);
  }
  if (elements.length > 0)
    parts.push(`Nail art: ${elements.map(e => e!.nameEn).join(', ')}.`);
  if (style) parts.push(`${style.nameEn} aesthetic.`);
  if (accentItems.length > 0 && accentItems[0]!.id !== 'none')
    parts.push(`Embellishments: ${accentItems.map(a => a!.nameEn).join(', ')}.`);
  if (finish) parts.push(`${finish.nameEn} topcoat finish.`);
  if (design.notes) parts.push(`Special request: ${design.notes}.`);

  parts.push(
    'Anatomically correct hand with natural finger proportions. Soft diffused studio lighting, shallow depth of field, blurred bokeh background, white marble surface. Magazine editorial quality. Absolutely no text, no watermarks, no logos, no letters, no writing anywhere in the image.'
  );

  return parts.join(' ');
}

export function buildSummaryHe(design: NailDesign): string {
  const shape = nailShapes.find(s => s.id === design.shape);
  const color = resolveColor(design.baseColor);
  const elements = design.designElements
    .map(id => designElements.find(e => e.id === id))
    .filter(Boolean);
  const style = styles.find(s => s.id === design.style);
  const accentItems = design.accents
    .map(id => accents.find(a => a.id === id))
    .filter(Boolean);
  const finish = finishes.find(f => f.id === design.finish);

  const length = nailLengths.find(l => l.id === design.length);

  const lines: string[] = ['💅 הזמנת עיצוב ציפורניים - Likjulim Studio', ''];

  const secondaryColor = resolveColor(design.secondaryColor);

  if (shape) lines.push(`צורה: ${shape.nameHe}`);
  if (length) lines.push(`אורך: ${length.nameHe}`);
  if (color) lines.push(`צבע בסיס: ${color.nameHe}`);
  if (secondaryColor) lines.push(`צבע שני: ${secondaryColor.nameHe} (${design.accentFingers.map(i => FINGER_NAMES_HE[i]).join(', ')})`);
  if (elements.length > 0)
    lines.push(`עיצוב: ${elements.map(e => e!.nameHe).join(', ')}`);
  if (style) lines.push(`סגנון: ${style.nameHe}`);
  if (accentItems.length > 0 && accentItems[0]!.id !== 'none')
    lines.push(`הדגשות: ${accentItems.map(a => a!.nameHe).join(', ')}`);
  if (finish) lines.push(`פיניש: ${finish.nameHe}`);
  if (design.notes) lines.push(`\nהערות: ${design.notes}`);

  return lines.join('\n');
}

export function getShapePath(shapeId: string): string {
  return nailShapes.find(s => s.id === shapeId)?.path
    || nailShapes[0].path;
}

export function isCustomColor(colorId: string): boolean {
  return colorId.startsWith('custom-');
}

export function getCustomHex(colorId: string): string {
  return colorId.replace('custom-', '');
}

export function resolveColor(colorId: string): { nameHe: string; nameEn: string; hex: string } | null {
  if (!colorId) return null;
  if (isCustomColor(colorId)) {
    const hex = getCustomHex(colorId);
    return { nameHe: `צבע מותאם (${hex})`, nameEn: `Custom color ${hex}`, hex };
  }
  const found = baseColors.find(c => c.id === colorId);
  return found ? { nameHe: found.nameHe, nameEn: found.nameEn, hex: found.hex } : null;
}

export function getColorHex(colorId: string): string {
  if (isCustomColor(colorId)) return getCustomHex(colorId);
  return baseColors.find(c => c.id === colorId)?.hex || '#F4C2C2';
}
