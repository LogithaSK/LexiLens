import { FaceRegionData } from '../types/makeup'

export const FACE_REGIONS: FaceRegionData[] = [
  {
    id: 'forehead',
    name: 'Forehead & Temples',
    cx: 150,
    cy: 70,
    r: 32,
    recommendedTechnique:
      'Warm bronzer dusted along the hairline in a soft crescent motion; minimal translucent powder pressed into the center to control high-shine glare while retaining natural skin dimension.',
    blushContourNote:
      'Contour or bronze the upper hairline and temples to frame the face and bring focus downward to the eyes. For high-contrast bridal photos, keep the very center illuminated.',
    productsUsed: ['Fit Me Matte Primer', 'Translucent Loose Powder', 'Master Chrome Highlighter'],
    blendingTip:
      'Blend backward into the baby hairs and hairline so there are no visible border demarcations.',
  },
  {
    id: 'eyelids',
    name: 'Eyelids & Brow Bone',
    cx: 150,
    cy: 118,
    r: 28,
    recommendedTechnique:
      'Prime with lightweight concealer and set with sheer powder. Apply transition matte shade in the crease socket with a fluffy dome brush, pressing metallic shimmer onto the mobile lid with a flat damp brush or finger.',
    blushContourNote:
      'Create depth by placing a deeper contour shade in the outer-V, diffusing inward. Touch champagne highlight beneath the brow arch.',
    productsUsed: ['Kay Beauty Eyeshadow Palette', 'Colossal Bold Liner', 'Pro Conceal Wand'],
    blendingTip:
      'Keep windshield-wiper circular motions soft at the crease boundary. Never allow hard pigment edges.',
  },
  {
    id: 'undereye',
    name: 'Under-eye Area & Tear Troughs',
    cx: 150,
    cy: 148,
    r: 22,
    recommendedTechnique:
      'Pinpoint peach/orange correction at the dark tear-trough groove. Tap hydrating concealer over the top. Press immediately with a powder puff dusted with fine loose powder to prevent smiling creases.',
    blushContourNote:
      'Keep contour and blush below the orbital socket bone. Avoid sweeping dark pigments or shimmers near the tear trough as this accentuates fine lines.',
    productsUsed: ['Pro Conceal Peach Corrector', 'Instant Age Rewind Concealer', 'Fit Me Loose Powder'],
    blendingTip:
      'Use the delicate pad of your ring finger with warm gentle tapping. Never drag sideways across thin under-eye skin.',
  },
  {
    id: 'cheeks',
    name: 'Cheekbones & Apples of Cheeks',
    cx: 98,
    cy: 185,
    r: 26,
    recommendedTechnique:
      'Duo-sculpting: matte contour hollowed right beneath the cheekbone angling toward the ear tragus; cream/powder blush placed on the upper apples diffusing upward into the hairline; champagne highlighter buffed onto the highest ridge of the cheekbone.',
    blushContourNote:
      'For a modern lifted look, apply blush higher along the zygomatic arch rather than directly on the front apples. This draws the eye upward for photography.',
    productsUsed: ['Rare Beauty Liquid Blush / Kay Creme Blush', 'Master Chrome Highlighter', 'Kay Hydrating Foundation'],
    blendingTip:
      'Blend blush, contour, and highlighter together where they meet with a clean fluffy brush so there are no distinct stripes.',
  },
  {
    id: 'nose',
    name: 'Bridge of Nose & Tip',
    cx: 150,
    cy: 185,
    r: 18,
    recommendedTechnique:
      'Two thin, parallel contour tracks drawn down the dorsal ridge with a slim pencil brush; soft highlight tapped along the center bridge and a tiny exclamation point dot at the tip button.',
    blushContourNote:
      'Subtle contouring refines nose definition under direct studio flashes and prevents the nose from appearing flattened by foundation.',
    productsUsed: ['Master Chrome Highlighter', 'Fit Me Loose Powder', 'Matte Contour Powder'],
    blendingTip:
      'Diffusing outward into the eye socket transition shade avoids two noticeable brown lines down the nose.',
  },
  {
    id: 'lips',
    name: 'Lips & Cupid\'s Bow',
    cx: 150,
    cy: 238,
    r: 24,
    recommendedTechnique:
      'Gently exfoliate and blot with lip balm. Trace the natural vermilion border with a matching lip pencil, slightly overlining only at the center cupid\'s bow and center bottom lip. Fill completely with long-wear lipstick.',
    blushContourNote:
      'A micro-touch of highlighter on the cupid\'s bow peaks creates an optical illusion of fuller, lifted lips.',
    productsUsed: ['SuperStay Matte Ink / MAC Retro Matte', 'Kay Matteinee Crayon', 'Highlighter'],
    blendingTip:
      'Blot between two thin layers using a tissue for 16-hour transfer resistance without dry cracking.',
  },
  {
    id: 'jawline',
    name: 'Jawline & Perimeters',
    cx: 80,
    cy: 245,
    r: 25,
    recommendedTechnique:
      'Sweep a cool-toned contour or deep matte powder directly along and slightly beneath the mandible bone, sweeping down into the neck.',
    blushContourNote:
      'Sharpens jawline definition and prevents any mismatch between facial foundation and neck skin tone.',
    productsUsed: ['Fit Me Matte Foundation', 'Contour Powder', 'Lasting Fix Setting Spray'],
    blendingTip:
      'Always sweep downward into the neck creases so no horizontal demarcation line remains visible in profile view.',
  },
  {
    id: 'chin',
    name: 'Chin & Mental Crease',
    cx: 150,
    cy: 275,
    r: 20,
    recommendedTechnique:
      'Apply light foundation stippled with a damp sponge. Press translucent powder onto the mental crease to prevent product migration from mouth movement.',
    blushContourNote:
      'Dust a tiny touch of warmth (blush or soft bronzer) across the chin point to tie the whole facial color story together cohesively.',
    productsUsed: ['Fit Me Loose Powder', 'Maybelline Blush', 'Lasting Fix Setting Spray'],
    blendingTip:
      'Keep coverage thin on the chin; thick makeup here is prone to breaking down around smiles.',
  },
]
