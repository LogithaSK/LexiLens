import { ExtractedColor, MakeupStyleType, OccasionType } from '../types/makeup'

export interface OutfitMakeupHarmony {
  outfitColorName: string
  colorHarmonyType: 'Complementary' | 'Monochromatic' | 'Analogous' | 'Warm Contrast'
  reasoning: string
  eyeshadowPalette: string[]
  eyeshadowDescription: string
  blushTones: string[]
  blushDescription: string
  lipstickShades: string[]
  lipstickDescription: string
  highlighterRecommendation: string
  recommendedStyle: MakeupStyleType
}

/**
 * Extracts dominant colors from an image using HTML5 Canvas pixel sampling and quantization.
 * Runs entirely client-side without sending photos to untrusted servers.
 */
export async function extractDominantColorsFromImage(
  imageSource: string,
  maxColors = 5
): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(FALLBACK_PALETTE.slice(0, maxColors))
          return
        }

        // Downscale for fast and representative pixel clustering
        const width = 100
        const height = Math.max(1, Math.floor((img.naturalHeight / img.naturalWidth) * 100))
        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)
        const imgData = ctx.getImageData(0, 0, width, height).data

        // Color quantization bucket map
        const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>()

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i]
          const g = imgData[i + 1]
          const b = imgData[i + 2]
          const a = imgData[i + 3]

          // Filter out near-white background, extreme near-black, and transparent
          if (a < 128) continue
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b
          if (brightness > 248 || brightness < 12) continue

          // Quantize into 32-step buckets
          const qr = Math.round(r / 32) * 32
          const qg = Math.round(g / 32) * 32
          const qb = Math.round(b / 32) * 32
          const key = `${qr},${qg},${qb}`

          const existing = colorBuckets.get(key)
          if (existing) {
            existing.count += 1
            existing.r = Math.round((existing.r + r) / 2)
            existing.g = Math.round((existing.g + g) / 2)
            existing.b = Math.round((existing.b + b) / 2)
          } else {
            colorBuckets.set(key, { r, g, b, count: 1 })
          }
        }

        const sorted = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count)
        const totalSampled = sorted.reduce((sum, item) => sum + item.count, 0) || 1

        const colors: ExtractedColor[] = sorted.slice(0, maxColors).map((item) => {
          const hex = rgbToHex(item.r, item.g, item.b)
          const name = identifyColorName(item.r, item.g, item.b)
          return {
            hex,
            rgb: [item.r, item.g, item.b],
            name,
            percentage: Math.round((item.count / totalSampled) * 100),
          }
        })

        if (colors.length === 0) {
          resolve(FALLBACK_PALETTE.slice(0, maxColors))
        } else {
          resolve(colors)
        }
      } catch (err) {
        console.warn('Canvas color extraction error, using fallback palette:', err)
        resolve(FALLBACK_PALETTE.slice(0, maxColors))
      }
    }
    img.onerror = () => {
      resolve(FALLBACK_PALETTE.slice(0, maxColors))
    }
    img.src = imageSource
  })
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)))
  const toHex = (c: number) => clamp(c).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    return [r, g, b]
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0
  return [r, g, b]
}

export function identifyColorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  if (diff < 20) {
    if (max > 190) return 'Ivory / Soft White'
    if (max > 120) return 'Silver / Neutral Grey'
    return 'Charcoal / Deep Slate'
  }

  // Red / Maroon / Pink / Coral
  if (r > g && r > b) {
    if (r > 120 && g < 45 && b < 60) return 'Maroon / Crimson'
    if (r > 160 && g < 110 && b < 120) return 'Deep Red / Ruby'
    if (r > 180 && g > 110 && b > 140) return 'Rose Pink / Blush'
    if (r > 180 && g > 90 && b < 110) return 'Coral / Peach'
    if (r > 140 && g > 60 && b < 50) return 'Rust / Terracotta'
    return 'Warm Red'
  }

  // Yellow / Gold / Mustard
  if (r > 150 && g > 130 && b < 90) {
    if (r > 200 && g > 180) return 'Champagne Gold'
    if (r > 170 && g > 130) return 'Antique Gold / Mustard'
    return 'Yellow Ochre'
  }

  // Green / Emerald / Sage
  if (g > r && g > b) {
    if (g > 100 && r < 70 && b < 90) return 'Emerald Green'
    if (g > 120 && r > 110 && b > 110) return 'Sage / Mint'
    if (g > 80 && r > 80 && b < 60) return 'Olive Green'
    return 'Forest Green'
  }

  // Blue / Navy / Royal
  if (b > r && b > g) {
    if (b > 120 && r < 60 && g < 70) return 'Royal Blue / Sapphire'
    if (b < 90 && r < 40 && g < 50) return 'Midnight Navy'
    if (b > 140 && g > 120) return 'Turquoise / Sky Blue'
    return 'Steel Blue'
  }

  // Purple / Lavender / Plum
  if (r > 90 && b > 90 && g < 80) {
    if (r > 140 && b > 140) return 'Magenta / Lavender'
    return 'Deep Plum / Wine'
  }

  return 'Warm Neutral'
}

export const FALLBACK_PALETTE: ExtractedColor[] = [
  { hex: '#7A1C24', rgb: [122, 28, 36], name: 'Maroon / Deep Crimson', percentage: 42 },
  { hex: '#D4AF37', rgb: [212, 175, 55], name: 'Antique Gold', percentage: 28 },
  { hex: '#2A4436', rgb: [42, 68, 54], name: 'Emerald Forest', percentage: 15 },
  { hex: '#F5E6CC', rgb: [245, 230, 204], name: 'Champagne Cream', percentage: 10 },
  { hex: '#D27D66', rgb: [210, 125, 102], name: 'Warm Terracotta', percentage: 5 },
]

export const MANUAL_SWATCHES: { name: string; hex: string }[] = [
  { name: 'Bridal Maroon', hex: '#7A1C24' },
  { name: 'Crimson Red', hex: '#B81424' },
  { name: 'Antique Gold', hex: '#D4AF37' },
  { name: 'Emerald Green', hex: '#1E5936' },
  { name: 'Royal Navy', hex: '#172B4D' },
  { name: 'Dusty Rose Pink', hex: '#C27D88' },
  { name: 'Mustard Yellow', hex: '#D99B26' },
  { name: 'Plum / Wine', hex: '#58213E' },
  { name: 'Ivory / Pearl', hex: '#F5EBE1' },
  { name: 'Champagne Peach', hex: '#E6A57E' },
]

/**
 * Computes cohesive makeup recommendations based on color theory and the user's selected preferences.
 */
export function generateOutfitMakeupHarmony(
  selectedColor: ExtractedColor,
  occasion: OccasionType,
  preferredStyle: MakeupStyleType
): OutfitMakeupHarmony {
  const colorName = selectedColor.name.toLowerCase()

  if (colorName.includes('maroon') || colorName.includes('crimson') || colorName.includes('ruby')) {
    return {
      outfitColorName: selectedColor.name,
      colorHarmonyType: 'Warm Contrast',
      reasoning:
        'Maroon and crimson possess rich, deep jewel undertones. Rather than matching eyeshadow to red (which can make the eyes look irritated or inflamed), warm antique golds, soft bronzes, and a defined winged eyeliner create a regal, high-contrast framing for the eyes. Lips can either echo the richness with a deep brick-rose or ruby red for traditional bridal opulence, or balance with a soft cinnamon nude if the eyes are smoked out.',
      eyeshadowPalette: ['#D4AF37', '#8C6239', '#3D2314', '#F4E8C1'],
      eyeshadowDescription: 'Antique gold leaf on mobile lids with warm chocolate matte in the crease socket and deep black winged liner.',
      blushTones: ['#D27D66', '#C46D5E'],
      blushDescription: 'Warm terracotta or toasted peach blush placed high on the cheekbones to balance warmth without competing with lip color.',
      lipstickShades: ['#7A1C24', '#992B35', '#A65B5B'],
      lipstickDescription: 'Deep brick ruby (e.g., M.A.C Ruby Woo / Kay Billboard) or velvety warm rose-nude.',
      highlighterRecommendation: 'Warm Champagne Gold or Molten Antique Bronze on cheekbone peaks.',
      recommendedStyle: occasion === 'Bridal' ? 'Traditional' : preferredStyle,
    }
  }

  if (colorName.includes('green') || colorName.includes('emerald') || colorName.includes('sage') || colorName.includes('olive')) {
    return {
      outfitColorName: selectedColor.name,
      colorHarmonyType: 'Complementary',
      reasoning:
        'Green sits directly opposite red, peach, and copper on the chromatic color wheel. Pairing an emerald or olive ensemble with warm coppers, champagne, and soft peachy-coral blush creates a vibrant, eye-catching color resonance that illuminates warm South Asian complexions without color clashing.',
      eyeshadowPalette: ['#C67D5A', '#E0A96D', '#4A2E1B', '#F9E4B7'],
      eyeshadowDescription: 'Rose gold and burnished copper foil across the lid, blended seamlessly with warm camel in the crease.',
      blushTones: ['#E88E74', '#D47E6A'],
      blushDescription: 'Warm apricot or sun-drenched peach blush buffed upward toward the temples.',
      lipstickShades: ['#B86B5A', '#8F3E42', '#C97A63'],
      lipstickDescription: 'Terracotta peach or spiced caramel-nude with satin finish.',
      highlighterRecommendation: 'Sunlit Gold or Soft Rose Champagne.',
      recommendedStyle: 'Soft Glam',
    }
  }

  if (colorName.includes('gold') || colorName.includes('yellow') || colorName.includes('mustard') || colorName.includes('champagne')) {
    return {
      outfitColorName: selectedColor.name,
      colorHarmonyType: 'Monochromatic',
      reasoning:
        'Golden and mustard tones radiate inherent warmth and luxury. A monochromatic warm bronze aesthetic with chocolate definition prevents the outfit from washing out the face, while a rich bold scarlet or deep berry-rose lip creates an unforgettable focal point.',
      eyeshadowPalette: ['#8C6239', '#B8860B', '#2B1A0E', '#FFF8DC'],
      eyeshadowDescription: 'Warm espresso smoked crease with reflective champagne satin on the inner half and brow bone.',
      blushTones: ['#C26D59', '#D9826C'],
      blushDescription: 'Warm bronze-peach dusted along the cheek hollows and diffused onto the apples.',
      lipstickShades: ['#991F2D', '#8C383E', '#A84B35'],
      lipstickDescription: 'Classic deep crimson red or warm spiced berry matte.',
      highlighterRecommendation: 'Molten Gold high on the cheekbones, bridge of nose, and cupid’s bow.',
      recommendedStyle: preferredStyle || 'Full Glam',
    }
  }

  if (colorName.includes('blue') || colorName.includes('navy') || colorName.includes('sapphire')) {
    return {
      outfitColorName: selectedColor.name,
      colorHarmonyType: 'Complementary',
      reasoning:
        'Navy and royal blue are cool, striking tones. Balancing cool attire with warm caramel, bronze, and peach facial makeup prevents the skin from appearing washed out or cold in photos. A soft peach or warm nude lip allows the deep blue outfit to remain the hero while keeping the face fresh and luminous.',
      eyeshadowPalette: ['#CD7F32', '#8B4513', '#1A237E', '#FFDFBA'],
      eyeshadowDescription: 'Bronzed almond eyes with subtle smudged navy shadow along the outer lower lash line for cohesive resonance.',
      blushTones: ['#E68369', '#DE7A68'],
      blushDescription: 'Warm muted coral or soft toasted cinnamon to inject vital warmth.',
      lipstickShades: ['#B2533E', '#A35D56', '#BD7067'],
      lipstickDescription: 'Soft spiced nude or velvety rosewood satin.',
      highlighterRecommendation: 'Frosted Champagne with warm golden reflect.',
      recommendedStyle: 'Soft Glam',
    }
  }

  if (colorName.includes('pink') || colorName.includes('rose') || colorName.includes('blush')) {
    return {
      outfitColorName: selectedColor.name,
      colorHarmonyType: 'Analogous',
      reasoning:
        'Pastel pinks and dusty rose garments thrive with an analogous romantic palette: mauve-taupe eyes, monochromatic rosy cheeks, and petal-soft lips. Soft charcoal liner instead of harsh liquid black keeps the romantic, ethereal bridal aesthetic unified.',
      eyeshadowPalette: ['#C99598', '#734B5E', '#F2D4D7', '#4A343D'],
      eyeshadowDescription: 'Soft mauve crease with crushed rose-gold shimmer on the lids and a diffused chocolate smoky lash line.',
      blushTones: ['#D98894', '#C47280'],
      blushDescription: 'Melted cream rose blush blended seamlessly over the high zygomatic cheek arch.',
      lipstickShades: ['#9E4758', '#BA6473', '#8A3B49'],
      lipstickDescription: 'Dirty rose-pink or romantic berry tint with soft blurred edges.',
      highlighterRecommendation: 'Pearlescent Pink-Champagne or Dewy Opal.',
      recommendedStyle: 'Natural',
    }
  }

  // Default Universal Harmony
  return {
    outfitColorName: selectedColor.name,
    colorHarmonyType: 'Warm Contrast',
    reasoning:
      'Neutral and varied attire provides full freedom to enhance natural facial undertones. We balance the look with timeless warm neutral shadows, a glowing skin base, and a customized lip shade that flatters your personal style.',
    eyeshadowPalette: ['#B8860B', '#8C6239', '#3D2314', '#F5EBE1'],
    eyeshadowDescription: 'Warm honey bronze and champagne shimmer with soft chocolate definition.',
    blushTones: ['#D27D66', '#E88E74'],
    blushDescription: 'Universal warm peach-rose buffed onto the apples of the cheeks.',
    lipstickShades: ['#8F3E42', '#A65B5B', '#BA6473'],
    lipstickDescription: 'Versatile warm rosewood or velvety terracotta nude.',
    highlighterRecommendation: 'Universal Champagne Gold.',
    recommendedStyle: preferredStyle,
  }
}
