export type OccasionType =
  | 'Everyday'
  | 'Bridal'
  | 'Reception'
  | 'Engagement'
  | 'Party'
  | 'Festive'
  | 'Photoshoot'
  | 'Evening'

export type MakeupStyleType =
  | 'Natural'
  | 'Traditional'
  | 'Soft Glam'
  | 'Full Glam'
  | 'Minimalist'
  | 'Dewy Glass Skin'

export type FinishType = 'Satin' | 'Matte' | 'Radiant Glow' | 'Natural Dewy'

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export type BudgetTier = 'budget' | 'mid-range' | 'premium' | 'custom'

export interface EventSettings {
  environment: 'Indoor' | 'Outdoor' | 'Mixed'
  timeOfDay: 'Daytime' | 'Evening' | 'Golden Hour'
  lighting: 'Natural Sunlight' | 'Warm Golden' | 'Cool LED' | 'Dim Ambient'
  photography: boolean
  flashPhotography: boolean
}

export interface ExtractedColor {
  hex: string
  rgb: [number, number, number]
  name: string
  percentage?: number
}

export interface SkinConcernGuide {
  id: string
  name: string
  description: string
  isNecessary: 'Necessary' | 'Optional' | 'Situation-dependent'
  suggestedCorrector: string
  targetArea: string
  approximateAmount: string
  applicationTechnique: string
  blendingInstructions: string
  subsequentStep: string
  commonMistakes: string[]
  colorHex: string
}

export interface ProductItem {
  id: string
  name: string
  brand: string
  category:
    | 'Primer'
    | 'Foundation'
    | 'Concealer'
    | 'Colour Corrector'
    | 'Setting Powder'
    | 'Eyeshadow'
    | 'Eyeliner'
    | 'Mascara'
    | 'Blush'
    | 'Contour'
    | 'Highlighter'
    | 'Lipstick'
    | 'Setting Spray'
  shade: string
  shadeGuidance: string
  price: number // in INR
  priceCategory: 'budget' | 'mid-range' | 'premium'
  description: string
  whyRecommended: string
  tutorialStepId: number
  imageUrl?: string
  purchaseLink: string
  inStock: boolean
  lastUpdated: string
  alternatives?: string[] // Product IDs of alternative options
}

export interface OwnedProduct {
  id: string
  name: string
  brand: string
  category: ProductItem['category']
  shade?: string
  price?: number
  expiryDate?: string
  addedAt: string
}

export interface TutorialStep {
  stepNumber: number
  title: string
  category: ProductItem['category'] | 'Skin Preparation'
  area: string
  productName: string
  amount: string
  applicationInstructions: string
  blendingInstructions: string
  mistakesToAvoid: string
  proTip: string
  completed: boolean
}

export interface RecommendedLook {
  id: string
  name: string
  occasion: OccasionType
  style: MakeupStyleType
  finish: FinishType
  toneClass: string
  heroImage: string
  description: string
  suitabilityRationale: string
  colorHarmonyReasoning?: string
  complexionSummary: string
  eyeMakeupSummary: string
  cheekContourSummary: string
  lipSummary: string
  difficulty: 'Easy' | 'Moderate' | 'Advanced'
  estimatedTimeMinutes: number
  products: ProductItem[]
  tutorial: TutorialStep[]
}

export interface FaceRegionData {
  id: string
  name: string
  cx: number
  cy: number
  r: number
  path?: string
  recommendedTechnique: string
  blushContourNote: string
  productsUsed: string[]
  blendingTip: string
}

export interface UCamTryonRequest {
  imageBase64: string
  lipstickColorHex?: string
  lipstickFinish?: 'matte' | 'satin' | 'gloss' | 'shimmer'
  blushColorHex?: string
  blushIntensity?: number
  eyeshadowColorHex?: string
  foundationTone?: string
}

export interface UCamTryonResponse {
  success: boolean
  processedImageBase64?: string
  previewUrl?: string
  apiUsed: 'ucam_cloud' | 'client_vision'
  message?: string
  error?: string
  retryAfterSeconds?: number
}

export interface SavedLookRecord {
  id: string
  savedAt: string
  name: string
  occasion: OccasionType
  style: MakeupStyleType
  look: RecommendedLook
  customBudget?: number
  budgetTier: BudgetTier
  userNotes?: string
}
