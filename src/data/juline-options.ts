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

export interface NailDesign {
  shape: string;
  baseColor: string;
  designElements: string[];
  style: string;
  accents: string[];
  finish: string;
  notes: string;
}

export const DEFAULT_DESIGN: NailDesign = {
  shape: '',
  baseColor: '',
  designElements: [],
  style: '',
  accents: [],
  finish: '',
  notes: '',
};

// ===== Steps =====

export const STEPS = [
  { id: 0, nameHe: 'צורה', nameEn: 'Shape' },
  { id: 1, nameHe: 'צבע בסיס', nameEn: 'Base Color' },
  { id: 2, nameHe: 'עיצוב', nameEn: 'Design' },
  { id: 3, nameHe: 'סגנון', nameEn: 'Style' },
  { id: 4, nameHe: 'הדגשות', nameEn: 'Accents' },
  { id: 5, nameHe: 'פיניש', nameEn: 'Finish' },
  { id: 6, nameHe: 'סיכום', nameEn: 'Summary' },
];

// ===== Nail Shapes (SVG paths, viewBox 0 0 60 90) =====

export const nailShapes: NailShape[] = [
  {
    id: 'almond',
    nameHe: 'שקדים',
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
    nameHe: 'קופסה',
    nameEn: 'Coffin',
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

// ===== Base Colors (20) =====

export const baseColors: ColorOption[] = [
  { id: 'classic-red', nameHe: 'אדום קלאסי', nameEn: 'Classic Red', hex: '#CC0000' },
  { id: 'cherry', nameHe: 'דובדבן', nameEn: 'Cherry', hex: '#9B111E' },
  { id: 'wine', nameHe: 'יין', nameEn: 'Wine', hex: '#722F37' },
  { id: 'hot-pink', nameHe: 'ורוד חם', nameEn: 'Hot Pink', hex: '#FF69B4' },
  { id: 'baby-pink', nameHe: 'ורוד בייבי', nameEn: 'Baby Pink', hex: '#F4C2C2' },
  { id: 'rose', nameHe: 'ורד', nameEn: 'Rose', hex: '#E8ADAA' },
  { id: 'dusty-rose', nameHe: 'ורוד מאובק', nameEn: 'Dusty Rose', hex: '#C48A8A' },
  { id: 'nude-pink', nameHe: 'נוד ורוד', nameEn: 'Nude Pink', hex: '#E8C4B8' },
  { id: 'nude-beige', nameHe: 'נוד בז\'', nameEn: 'Nude Beige', hex: '#D9B99B' },
  { id: 'champagne', nameHe: 'שמפניה', nameEn: 'Champagne', hex: '#F7E7CE' },
  { id: 'french-white', nameHe: 'לבן צרפתי', nameEn: 'French White', hex: '#FFFAF0' },
  { id: 'milky', nameHe: 'חלבי', nameEn: 'Milky White', hex: '#FEF9F0' },
  { id: 'lavender', nameHe: 'לבנדר', nameEn: 'Lavender', hex: '#B57EDC' },
  { id: 'mint', nameHe: 'מנטה', nameEn: 'Mint', hex: '#98D4A2' },
  { id: 'baby-blue', nameHe: 'תכלת בייבי', nameEn: 'Baby Blue', hex: '#89CFF0' },
  { id: 'black', nameHe: 'שחור', nameEn: 'Black', hex: '#1A1A1A' },
  { id: 'navy', nameHe: 'כחול כהה', nameEn: 'Navy', hex: '#1B2A4A' },
  { id: 'dark-plum', nameHe: 'שזיף כהה', nameEn: 'Dark Plum', hex: '#4E2A84' },
  { id: 'sage-green', nameHe: 'ירוק מרווה', nameEn: 'Sage Green', hex: '#9CAF88' },
  { id: 'terracotta', nameHe: 'טרקוטה', nameEn: 'Terracotta', hex: '#CC6A4C' },
];

// ===== Design Elements (20) =====

export const designElements: DesignOption[] = [
  { id: 'french-tip', nameHe: 'צרפתי', nameEn: 'French tip', icon: '🇫🇷' },
  { id: 'flowers', nameHe: 'פרחים', nameEn: 'Floral art', icon: '🌸' },
  { id: 'marble', nameHe: 'שיש', nameEn: 'Marble effect', icon: '🪨' },
  { id: 'ombre', nameHe: 'אומברה', nameEn: 'Ombre gradient', icon: '🎨' },
  { id: 'geometric', nameHe: 'גאומטרי', nameEn: 'Geometric patterns', icon: '🔷' },
  { id: 'abstract', nameHe: 'אבסטרקט', nameEn: 'Abstract art', icon: '🌀' },
  { id: 'animal-print', nameHe: 'הדפס חיות', nameEn: 'Animal print', icon: '🐆' },
  { id: 'stars', nameHe: 'כוכבים', nameEn: 'Stars', icon: '⭐' },
  { id: 'hearts', nameHe: 'לבבות', nameEn: 'Hearts', icon: '💕' },
  { id: 'waves', nameHe: 'גלים', nameEn: 'Waves', icon: '🌊' },
  { id: 'leaves', nameHe: 'עלים', nameEn: 'Leaves and botanicals', icon: '🌿' },
  { id: 'butterflies', nameHe: 'פרפרים', nameEn: 'Butterflies', icon: '🦋' },
  { id: 'dots', nameHe: 'נקודות', nameEn: 'Polka dots', icon: '⚪' },
  { id: 'stripes', nameHe: 'פסים', nameEn: 'Stripes', icon: '📏' },
  { id: 'lace', nameHe: 'תחרה', nameEn: 'Lace pattern', icon: '🪡' },
  { id: 'swirls', nameHe: 'ספירלות', nameEn: 'Swirls', icon: '🌀' },
  { id: 'negative-space', nameHe: 'חלל שלילי', nameEn: 'Negative space design', icon: '◻️' },
  { id: '3d-art', nameHe: 'תלת-מימד', nameEn: '3D nail art elements', icon: '💎' },
  { id: 'watercolor', nameHe: 'צבעי מים', nameEn: 'Watercolor effect', icon: '💧' },
  { id: 'checkerboard', nameHe: 'שחמט', nameEn: 'Checkerboard pattern', icon: '♟️' },
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
  { id: 'chains', nameHe: 'שרשראות', nameEn: 'Tiny chains', icon: '⛓️' },
  { id: 'dried-flowers', nameHe: 'פרחים יבשים', nameEn: 'Dried flowers', icon: '🌾' },
  { id: 'sugar', nameHe: 'סוכר', nameEn: 'Sugar texture', icon: '🧂' },
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
  { id: 'cream', nameHe: 'קרמי', nameEn: 'Cream', icon: '🍦' },
  { id: 'metallic', nameHe: 'מטאלי', nameEn: 'Metallic', icon: '⚙️' },
  { id: 'ice', nameHe: 'קרח', nameEn: 'Ice crystal', icon: '❄️' },
  { id: 'dewy', nameHe: 'טללים', nameEn: 'Dewy fresh', icon: '💧' },
  { id: 'clear-gel', nameHe: 'ג\'ל שקוף', nameEn: 'Clear gel', icon: '💠' },
];

// ===== Utility Functions =====

export function buildPrompt(design: NailDesign): string {
  const shape = nailShapes.find(s => s.id === design.shape);
  const color = baseColors.find(c => c.id === design.baseColor);
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

  if (shape) parts.push(`${shape.nameEn} shaped`);
  parts.push('gel nail extensions.');

  if (color) parts.push(`Full even coverage of ${color.nameEn} gel polish on every nail from cuticle to free edge.`);
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
  const color = baseColors.find(c => c.id === design.baseColor);
  const elements = design.designElements
    .map(id => designElements.find(e => e.id === id))
    .filter(Boolean);
  const style = styles.find(s => s.id === design.style);
  const accentItems = design.accents
    .map(id => accents.find(a => a.id === id))
    .filter(Boolean);
  const finish = finishes.find(f => f.id === design.finish);

  const lines: string[] = ['💅 הזמנת עיצוב ציפורניים - Juline Studio', ''];

  if (shape) lines.push(`צורה: ${shape.nameHe}`);
  if (color) lines.push(`צבע בסיס: ${color.nameHe}`);
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

export function getColorHex(colorId: string): string {
  return baseColors.find(c => c.id === colorId)?.hex || '#F4C2C2';
}
