import { SkinConcernGuide } from '../types/makeup'

export const COLOR_CORRECTION_GUIDES: SkinConcernGuide[] = [
  {
    id: 'undereye_blue_purple',
    name: 'Under-eye Darkness (Bluish / Purplish Tones)',
    description:
      'Perceived bluish or purplish shadows beneath the lower lash line, often noticeable where delicate skin reveals underlying vascular tone.',
    isNecessary: 'Optional',
    suggestedCorrector: 'Peach corrector for fair-to-medium skin; Rich Orange/Bisque for tan, deep, and rich skin tones.',
    colorHex: '#f09873',
    targetArea: 'Tear trough hollow and inner half of the under-eye area only.',
    approximateAmount: 'Pinhead-sized drop (less than half a pea).',
    applicationTechnique:
      'Dot sparingly only on the darkest groove or shadow recess. Avoid sweeping product across the outer smiling creases where skin moves frequently.',
    blendingInstructions:
      'Gently pat with a ring finger or miniature damp makeup sponge until the blue undertone is neutralized into a warm neutral tone. Do not rub or drag.',
    subsequentStep:
      'Allow 45 seconds to set, then lightly layer your skin-matching liquid concealer on top, finishing with a micro-fine translucent powder pressing.',
    commonMistakes: [
      'Using an orange corrector that is overly vibrant on fair skin, causing an unnatural terracotta cast.',
      'Applying thick corrector up to the lower waterline, which can cake and crease.',
      'Skipping the skin-toned concealer layer over the corrector.',
    ],
  },
  {
    id: 'redness_rosy',
    name: 'Visible Surface Redness & Flush',
    description:
      'Superficial pinkish or red flush around the nasal folds, center of cheeks, or chin.',
    isNecessary: 'Situation-dependent',
    suggestedCorrector: 'Pastel Mint Green or Muted Sage Corrector.',
    colorHex: '#99c2a2',
    targetArea: 'Sides of the nostrils, center of chin, or localized red patches.',
    approximateAmount: 'Half a pump or two tiny sheer micro-dots.',
    applicationTechnique:
      'Press with clean fingertips or a flat synthetic concealer brush directly over the flush. Green sits opposite red on the optical color wheel, canceling redness optically.',
    blendingInstructions:
      'Feather outward softly until the green hue is sheer and diffuse. The goal is neutralization, not visible green pigment.',
    subsequentStep:
      'Stipple a medium-coverage foundation or skin tint directly over the area using a damp sponge. Avoid aggressive buffing which can displace the corrector.',
    commonMistakes: [
      'Applying green corrector all over the entire face, which leads to an ashy, drained complexion.',
      'Using too opaque a green paste without sufficient blending.',
      'Vigorously dragging a dense brush across the corrected patch.',
    ],
  },
  {
    id: 'hyperpigmentation_dark_marks',
    name: 'Deep Pigmentation & Post-Blemish Shadows',
    description:
      'Dark brown, greyish, or warm brownish spots and sun-induced discoloration.',
    isNecessary: 'Optional',
    suggestedCorrector: 'Warm Amber, Apricot, or Deep Peach Corrector.',
    colorHex: '#e58c58',
    targetArea: 'Directly on individual spots, corners of the mouth, or forehead perimeters.',
    approximateAmount: 'Micro-dot per spot using a fine-point detail brush.',
    applicationTechnique:
      'Pinpoint application: touch the very center of the spot with the tip of a fine synthetic brush. Keep the product within the boundary of the mark.',
    blendingInstructions:
      'Softly tap the edge of the dot with a fingertip or mini sponge to soften the halo without removing the concentrated core.',
    subsequentStep:
      'Dab a high-pigment, skin-matching cream or liquid concealer, let sit for 30 seconds to gain tackiness, and set with pressed translucent powder.',
    commonMistakes: [
      'Spreading corrector in wide swatches over clear surrounding skin, creating dark circles around the blemish.',
      'Rubbing vigorously before the product has anchored.',
    ],
  },
  {
    id: 'dullness_sallow',
    name: 'Uneven or Sallow / Yellow-Cast Undertone',
    description:
      'Tired-looking skin that feels flat, lacklustre, or has an excessively yellow-olive cast in dull lighting.',
    isNecessary: 'Optional',
    suggestedCorrector: 'Soft Lavender or Cool Lilac Primer / Corrector.',
    colorHex: '#c7b3e5',
    targetArea: 'Cheekbones, center of forehead, bridge of nose, and collarbones.',
    approximateAmount: 'Pea-sized amount blended with primer.',
    applicationTechnique:
      'Diffuse across the high planes of the face to brighten and add an optical luminous radiance.',
    blendingInstructions:
      'Smooth in upward, sweeping motions like a moisturizing serum until completely absorbed.',
    subsequentStep:
      'Follow with a lightweight radiant foundation or tinted moisturizer.',
    commonMistakes: [
      'Using lilac on very deep, warm golden complexions without testing, which can create a chalky veil.',
    ],
  },
  {
    id: 'purplish_shadows',
    name: 'Purple or Bruise-Toned Discoloration',
    description:
      'Deep purplish shadows sometimes observed along outer eye hollows or near delicate capillary zones.',
    isNecessary: 'Situation-dependent',
    suggestedCorrector: 'Warm Primrose Yellow Corrector.',
    colorHex: '#eed571',
    targetArea: 'Outer eye hollows and purplish localized shadows.',
    approximateAmount: 'One tiny droplet.',
    applicationTechnique:
      'Yellow neutralizes purple on the chromatic wheel. Lightly press onto the purple shadow with a soft blender.',
    blendingInstructions:
      'Melt into the skin with warm fingertip taps until the purple hue recedes into an even tone.',
    subsequentStep:
      'Apply standard concealer and set lightly with a setting spray before powdering.',
    commonMistakes: [
      'Over-applying yellow onto areas that do not have purple tones, turning the skin yellow.',
    ],
  },
]
