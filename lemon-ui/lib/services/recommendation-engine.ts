import { PRODUCT_CATALOGUE } from '../data/product-catalogue'
import {
  BudgetTier,
  EventSettings,
  ExperienceLevel,
  ExtractedColor,
  FinishType,
  MakeupStyleType,
  OccasionType,
  ProductItem,
  RecommendedLook,
} from '../types/makeup'
import { generateOutfitMakeupHarmony } from './color-extractor'
import { generateStepByStepTutorial } from './tutorial-generator'

export interface UserPreferencesInput {
  occasion: OccasionType
  style: MakeupStyleType
  finish: FinishType
  experienceLevel: ExperienceLevel
  budgetTier: BudgetTier
  customBudget?: number
  selectedOutfitColor?: ExtractedColor
  eventSettings: EventSettings
  selectedConcerns: string[]
}

export interface BudgetBreakdown {
  targetBudget: number
  totalCost: number
  isOverBudget: boolean
  shortfall: number
  savingsFromOwned: number
  netPayableCost: number
  lowerCostAlternativesAvailable: boolean
}

export function recommendMakeupLook(input: UserPreferencesInput): RecommendedLook {
  const {
    occasion,
    style,
    finish,
    experienceLevel,
    budgetTier,
    selectedOutfitColor,
    eventSettings,
    selectedConcerns,
  } = input

  // Generate outfit harmony if color is selected
  const outfitHarmony = selectedOutfitColor
    ? generateOutfitMakeupHarmony(selectedOutfitColor, occasion, style)
    : undefined

  // Determine look title and aesthetic based on deterministic combinations
  let lookId = 'custom-look'
  let lookName = 'Soft Focus Signature'
  let toneClass = 'look-peach'
  let heroImage = 'https://images.unsplash.com/photo-1522337360788-8b13dead2a0e?auto=format&fit=crop&w=1200&q=85'
  let difficulty: 'Easy' | 'Moderate' | 'Advanced' = 'Easy'
  let estimatedTimeMinutes = 20

  if (occasion === 'Bridal') {
    lookId = 'royal-bridal'
    lookName = style === 'Traditional' ? 'Royal Traditional Bride' : 'Modern Radiant Bride'
    toneClass = 'look-rose'
    heroImage = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=90'
    difficulty = experienceLevel === 'Beginner' ? 'Moderate' : 'Advanced'
    estimatedTimeMinutes = 45
  } else if (occasion === 'Reception' || occasion === 'Evening' || occasion === 'Party') {
    lookId = 'golden-hour-glam'
    lookName = style === 'Full Glam' ? 'Golden Hour Siren' : 'Twilight Soft Glam'
    toneClass = 'look-gold'
    heroImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85'
    difficulty = 'Moderate'
    estimatedTimeMinutes = 35
  } else if (occasion === 'Festive' || occasion === 'Engagement') {
    lookId = 'festive-radiance'
    lookName = 'Festive Dewy Blossom'
    toneClass = 'look-rose'
    heroImage = 'https://images.unsplash.com/photo-1522337360788-8b13dead2a0e?auto=format&fit=crop&w=1200&q=85'
    difficulty = 'Moderate'
    estimatedTimeMinutes = 30
  } else {
    // Everyday / Photoshoot / Minimalist
    lookId = 'soft-focus-daily'
    lookName = style === 'Minimalist' ? 'Clean Girl Minimalist' : 'Effortless Sunlit Satin'
    toneClass = 'look-peach'
    heroImage = 'https://images.unsplash.com/photo-1522337360788-8b13dead2a0e?auto=format&fit=crop&w=1200&q=85'
    difficulty = 'Easy'
    estimatedTimeMinutes = 15
  }

  // Adjust time according to experience level
  if (experienceLevel === 'Beginner') estimatedTimeMinutes += 10
  if (experienceLevel === 'Advanced') estimatedTimeMinutes = Math.max(20, estimatedTimeMinutes - 5)

  // Construct personalized rationale explaining why the look suits their preferences
  const suitabilityRationale = [
    `Curated specifically for your ${occasion.toLowerCase()} occasion with a ${style.toLowerCase()} mood and ${finish.toLowerCase()} finish.`,
    eventSettings.photography || eventSettings.flashPhotography
      ? 'Because your event involves active flash photography, we calibrated silica-free translucent setting powders and matte-transition eyes to eliminate camera flare and flashback.'
      : 'Calibrated for flattering natural illumination with breathable, skin-first texture.',
    eventSettings.lighting === 'Dim Ambient' || eventSettings.timeOfDay === 'Evening'
      ? 'Under evening lighting, subtle dimension and champagne highlights are intensified so features remain distinct and radiant.'
      : 'Under daytime sunlight, complexion coverage remains micro-thin and second-skin.',
    outfitHarmony ? outfitHarmony.reasoning : '',
  ]
    .filter(Boolean)
    .join(' ')

  const complexionSummary = `${finish} finish with primer pore-blurring and skin-matched liquid foundation stippled with a damp sponge.`
  const eyeMakeupSummary = outfitHarmony
    ? outfitHarmony.eyeshadowDescription
    : `Warm neutral champagne and bronze tones with precision winged definition.`
  const cheekContourSummary = outfitHarmony
    ? `${outfitHarmony.blushDescription} with ${outfitHarmony.highlighterRecommendation}.`
    : `Soft warm peach/rose blush with champagne gold cheekbone illumination.`
  const lipSummary = outfitHarmony
    ? outfitHarmony.lipstickDescription
    : `Long-wearing velvety matte lip in flattering warm rosewood.`

  // Filter products based on budget tier and category requirements
  const selectedProducts = selectProductsForLook(budgetTier, input.customBudget, selectedConcerns)

  // Generate customized step-by-step tutorial
  const tutorial = generateStepByStepTutorial({
    lookName,
    occasion,
    style,
    finish,
    experienceLevel,
    selectedConcerns,
    products: selectedProducts,
  })

  return {
    id: lookId,
    name: lookName,
    occasion,
    style,
    finish,
    toneClass,
    heroImage,
    description: `A customized ${style.toLowerCase()} look designed for your ${occasion.toLowerCase()} with a luminous ${finish.toLowerCase()} glow.`,
    suitabilityRationale,
    colorHarmonyReasoning: outfitHarmony?.reasoning,
    complexionSummary,
    eyeMakeupSummary,
    cheekContourSummary,
    lipSummary,
    difficulty,
    estimatedTimeMinutes,
    products: selectedProducts,
    tutorial,
  }
}

/**
 * Selects one recommended product per necessary category, prioritized by budget tier.
 */
export function selectProductsForLook(
  budgetTier: BudgetTier,
  customBudget?: number,
  selectedConcerns: string[] = []
): ProductItem[] {
  const categories: ProductItem['category'][] = [
    'Primer',
    'Foundation',
    'Concealer',
    'Setting Powder',
    'Eyeshadow',
    'Eyeliner',
    'Blush',
    'Highlighter',
    'Lipstick',
    'Setting Spray',
  ]

  // Add colour corrector if concerns are present
  if (selectedConcerns.length > 0) {
    categories.splice(2, 0, 'Colour Corrector')
  }

  // Target price category mapped to budget tier
  let targetPriceCat: 'budget' | 'mid-range' | 'premium' = 'mid-range'
  if (budgetTier === 'budget') targetPriceCat = 'budget'
  else if (budgetTier === 'premium') targetPriceCat = 'premium'
  else if (budgetTier === 'custom' && customBudget) {
    const avgPerItem = customBudget / categories.length
    if (avgPerItem < 700) targetPriceCat = 'budget'
    else if (avgPerItem < 1800) targetPriceCat = 'mid-range'
    else targetPriceCat = 'premium'
  }

  const result: ProductItem[] = []

  for (const cat of categories) {
    const catProducts = PRODUCT_CATALOGUE.filter((p) => p.category === cat)
    // Find matching tier product first
    let chosen = catProducts.find((p) => p.priceCategory === targetPriceCat)
    if (!chosen) {
      // Fallback to nearest tier
      chosen = catProducts[0]
    }
    if (chosen) {
      result.push(chosen)
    }
  }

  return result
}

/**
 * Calculates budget totals, shortfalls, and substitution recommendations.
 */
export function calculateBudgetBreakdown(
  products: ProductItem[],
  ownedProductIds: string[],
  budgetTier: BudgetTier,
  customBudget?: number
): BudgetBreakdown {
  let targetBudget = 5000 // default mid-range
  if (budgetTier === 'budget') targetBudget = 3000
  else if (budgetTier === 'premium') targetBudget = 15000
  else if (budgetTier === 'custom' && customBudget) targetBudget = customBudget

  const totalCost = products.reduce((sum, p) => sum + p.price, 0)

  let savingsFromOwned = 0
  for (const prod of products) {
    if (ownedProductIds.includes(prod.id)) {
      savingsFromOwned += prod.price
    }
  }

  const netPayableCost = Math.max(0, totalCost - savingsFromOwned)
  const isOverBudget = netPayableCost > targetBudget
  const shortfall = isOverBudget ? netPayableCost - targetBudget : 0

  // Check if any product can be swapped to a lower-cost alternative
  const lowerCostAlternativesAvailable = products.some((p) => {
    if (p.priceCategory === 'budget') return false
    const alternatives = PRODUCT_CATALOGUE.filter(
      (alt) => alt.category === p.category && alt.price < p.price
    )
    return alternatives.length > 0
  })

  return {
    targetBudget,
    totalCost,
    isOverBudget,
    shortfall,
    savingsFromOwned,
    netPayableCost,
    lowerCostAlternativesAvailable,
  }
}

/**
 * Automatically creates a lower-cost product kit substitution to fit within budget limits.
 */
export function getBudgetOptimizedKit(
  currentProducts: ProductItem[],
  targetBudget: number
): ProductItem[] {
  return currentProducts.map((prod) => {
    // Find lowest priced item in same category
    const catItems = PRODUCT_CATALOGUE.filter((p) => p.category === prod.category)
    const cheapest = catItems.reduce((min, curr) => (curr.price < min.price ? curr : min), catItems[0])
    return cheapest || prod
  })
}
