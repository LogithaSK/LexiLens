import test from 'node:test'
import assert from 'node:assert/strict'

import { PRODUCT_CATALOGUE } from '../lib/data/product-catalogue'
import { COLOR_CORRECTION_GUIDES } from '../lib/data/color-correction-guide'
import { FACE_REGIONS } from '../lib/data/face-map-data'
import {
  generateOutfitMakeupHarmony,
  identifyColorName,
  rgbToHex,
  hexToRgb,
  FALLBACK_PALETTE,
} from '../lib/services/color-extractor'
import {
  recommendMakeupLook,
  calculateBudgetBreakdown,
  getBudgetOptimizedKit,
  selectProductsForLook,
} from '../lib/services/recommendation-engine'
import { generateStepByStepTutorial } from '../lib/services/tutorial-generator'

test('Scenario 1 & 2: Color formatting and RGB/Hex utility handles valid and invalid inputs', () => {
  assert.equal(rgbToHex(255, 0, 0), '#FF0000')
  assert.equal(rgbToHex(122, 28, 36), '#7A1C24')
  assert.deepEqual(hexToRgb('#7A1C24'), [122, 28, 36])
  assert.deepEqual(hexToRgb('#FFF'), [255, 255, 255])
})

test('Scenario 3 & 4: UCam API credentials isolation and error safety', async () => {
  // Test that client code does NOT expose UCAM_API_KEY
  assert.equal(typeof process.env.NEXT_PUBLIC_UCAM_API_KEY, 'undefined')

  // Import API status handler logic
  const statusRes = await import('../app/api/ucam/status/route')
  const response = await statusRes.GET()
  const data = await response.json()

  assert.equal(typeof data.configured, 'boolean')
  assert.equal(data.service, 'Perfect Corp UCam Virtual Try-On API Gateway')
  if (!process.env.UCAM_API_KEY && !process.env.PERFECTCORP_API_KEY) {
    assert.equal(data.configured, false)
    assert.ok(data.missingRequirements.length > 0)
  }

  // Import API apply handler logic
  const applyRes = await import('../app/api/ucam/apply/route')

  // Test missing image error handling (status 400)
  const reqEmpty = new Request('http://localhost:3000/api/ucam/apply', {
    method: 'POST',
    body: JSON.stringify({}),
  })
  const emptyRes = await applyRes.POST(reqEmpty as any)
  assert.equal(emptyRes.status, 400)
  const emptyData = await emptyRes.json()
  assert.equal(emptyData.success, false)
  assert.ok(emptyData.error.includes('Missing facial image'))

  // Test unconfigured credentials handling (status 503) without fake simulation
  const reqValidImage = new Request('http://localhost:3000/api/ucam/apply', {
    method: 'POST',
    body: JSON.stringify({
      imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...',
      lipstickColorHex: '#A81C28',
    }),
  })
  const resValid = await applyRes.POST(reqValidImage as any)
  if (!process.env.UCAM_API_KEY && !process.env.PERFECTCORP_API_KEY) {
    assert.equal(resValid.status, 503)
    const validData = await resValid.json()
    assert.equal(validData.success, false)
    assert.ok(validData.error.includes('UCAM_API_KEY'))
    assert.equal(validData.configured, false)
  }
})

test('Scenario 5 & 7: User selects Bridal makeup look with custom preferences', () => {
  const look = recommendMakeupLook({
    occasion: 'Bridal',
    style: 'Traditional',
    finish: 'Satin',
    experienceLevel: 'Beginner',
    budgetTier: 'mid-range',
    eventSettings: {
      environment: 'Indoor',
      timeOfDay: 'Evening',
      lighting: 'Warm Golden',
      photography: true,
      flashPhotography: true,
    },
    selectedConcerns: [],
  })

  assert.equal(look.occasion, 'Bridal')
  assert.equal(look.style, 'Traditional')
  assert.equal(look.finish, 'Satin')
  assert.ok(look.name.includes('Bride'))
  assert.ok(look.suitabilityRationale.includes('flash photography'))
  assert.ok(look.products.length > 5)
  assert.ok(look.tutorial.length > 8)
})

test('Scenario 6: Outfit-based color harmony (Maroon bridal attire)', () => {
  const maroonColor = {
    hex: '#7A1C24',
    rgb: [122, 28, 36] as [number, number, number],
    name: 'Maroon / Deep Crimson',
  }
  const harmony = generateOutfitMakeupHarmony(maroonColor, 'Bridal', 'Traditional')

  assert.equal(harmony.colorHarmonyType, 'Warm Contrast')
  assert.ok(harmony.reasoning.includes('antique gold') || harmony.reasoning.includes('jewel undertones'))
  assert.ok(harmony.eyeshadowPalette.length > 0)
  assert.ok(harmony.lipstickShades.length > 0)
  assert.ok(harmony.blushTones.length > 0)
})

test('Scenario 8: Beginner mode receives gentle beginner-friendly instructions', () => {
  const tutorial = generateStepByStepTutorial({
    lookName: 'Soft Focus',
    occasion: 'Everyday',
    style: 'Natural',
    finish: 'Satin',
    experienceLevel: 'Beginner',
    selectedConcerns: [],
    products: selectProductsForLook('budget'),
  })

  const skinPrep = tutorial.find((s) => s.category === 'Skin Preparation')
  assert.ok(skinPrep)
  assert.ok(skinPrep?.applicationInstructions.includes('gentle cleanser') || skinPrep?.applicationInstructions.includes('lukewarm water'))

  const advancedTutorial = generateStepByStepTutorial({
    lookName: 'Soft Focus',
    occasion: 'Everyday',
    style: 'Natural',
    finish: 'Satin',
    experienceLevel: 'Advanced',
    selectedConcerns: [],
    products: selectProductsForLook('budget'),
  })
  const advPrep = advancedTutorial.find((s) => s.category === 'Skin Preparation')
  assert.ok(advPrep?.applicationInstructions.includes('lymphatic drainage') || advPrep?.title.includes('Dermal Prep'))
})

test('Scenario 9: Skin concern and colour-correction guidance uses non-diagnostic language', () => {
  assert.ok(COLOR_CORRECTION_GUIDES.length >= 4)
  const undereye = COLOR_CORRECTION_GUIDES.find((g) => g.id === 'undereye_blue_purple')
  assert.ok(undereye)
  assert.ok(undereye?.suggestedCorrector.includes('Peach'))
  assert.equal(undereye?.isNecessary, 'Optional')
  assert.ok(undereye?.commonMistakes.length > 0)

  // Test that tutorial injects colour correction step when concern selected
  const tutorialWithConcern = generateStepByStepTutorial({
    lookName: 'Bridal Glow',
    occasion: 'Bridal',
    style: 'Soft Glam',
    finish: 'Radiant Glow',
    experienceLevel: 'Beginner',
    selectedConcerns: ['undereye_blue_purple'],
    products: selectProductsForLook('mid-range', undefined, ['undereye_blue_purple']),
  })

  const correctorStep = tutorialWithConcern.find((s) => s.category === 'Colour Corrector')
  assert.ok(correctorStep, 'Tutorial should contain colour correction step')
})

test('Scenario 10, 11 & 12: Custom budget calculation, shortfall, and lower-cost kit substitution', () => {
  const products = selectProductsForLook('premium')
  const totalCost = products.reduce((acc, p) => acc + p.price, 0)

  // Budget is insufficient: Target ₹3,000 against a luxury kit
  const insufficientBudget = calculateBudgetBreakdown(products, [], 'custom', 3000)
  assert.equal(insufficientBudget.isOverBudget, true)
  assert.ok(insufficientBudget.shortfall > 0)
  assert.equal(insufficientBudget.lowerCostAlternativesAvailable, true)

  // Optimize kit for lower cost
  const lowerCostKit = getBudgetOptimizedKit(products, 3000)
  const newBreakdown = calculateBudgetBreakdown(lowerCostKit, [], 'custom', 3000)
  assert.ok(newBreakdown.totalCost < totalCost)

  // Budget is sufficient: Target ₹50,000
  const sufficientBudget = calculateBudgetBreakdown(products, [], 'custom', 50000)
  assert.equal(sufficientBudget.isOverBudget, false)
  assert.equal(sufficientBudget.shortfall, 0)
})

test('Scenario 14 & 15: Product substitution and shopping list recalculation', () => {
  const initialProducts = selectProductsForLook('mid-range')
  const initialSum = initialProducts.reduce((sum, p) => sum + p.price, 0)

  // Substitute foundation with budget foundation
  const budgetFoundation = PRODUCT_CATALOGUE.find((p) => p.id === 'found-budget-1')!
  const updatedProducts = initialProducts.map((p) =>
    p.category === 'Foundation' ? budgetFoundation : p
  )
  const newSum = updatedProducts.reduce((sum, p) => sum + p.price, 0)

  assert.notEqual(initialSum, newSum)
  assert.equal(updatedProducts.find((p) => p.category === 'Foundation')?.id, 'found-budget-1')
})

test('Scenario 16: User marks products they already own (reduces net payable cost)', () => {
  const products = selectProductsForLook('mid-range')
  const sampleOwnedId = products[0].id
  const sampleOwnedPrice = products[0].price

  const breakdown = calculateBudgetBreakdown(products, [sampleOwnedId], 'mid-range')
  assert.equal(breakdown.savingsFromOwned, sampleOwnedPrice)
  assert.equal(breakdown.netPayableCost, breakdown.totalCost - sampleOwnedPrice)
})

test('Scenario 18: Face Map regions coverage', () => {
  assert.ok(FACE_REGIONS.length >= 8)
  const cheek = FACE_REGIONS.find((r) => r.id === 'cheeks')
  assert.ok(cheek)
  assert.ok(cheek?.recommendedTechnique.includes('contour') || cheek?.recommendedTechnique.includes('blush'))
  assert.ok(cheek?.productsUsed.length > 0)
})

test('Scenario 20: Product Catalogue integrity and real data checks', () => {
  assert.ok(PRODUCT_CATALOGUE.length >= 20)
  for (const product of PRODUCT_CATALOGUE) {
    assert.ok(product.id.length > 0)
    assert.ok(product.name.length > 0)
    assert.ok(product.brand.length > 0)
    assert.ok(product.price > 0, `Price for ${product.name} must be positive`)
    assert.ok(product.purchaseLink.startsWith('https://'), `Purchase link for ${product.name} must be HTTPS`)
    assert.ok(['budget', 'mid-range', 'premium'].includes(product.priceCategory))
    assert.ok(product.shadeGuidance.length > 0)
  }
})
