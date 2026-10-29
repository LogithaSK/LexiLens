import { ExperienceLevel, FinishType, MakeupStyleType, OccasionType, ProductItem, TutorialStep } from '../types/makeup'

interface TutorialGenerationParams {
  lookName: string
  occasion: OccasionType
  style: MakeupStyleType
  finish: FinishType
  experienceLevel: ExperienceLevel
  selectedConcerns: string[]
  products: ProductItem[]
}

export function generateStepByStepTutorial({
  lookName,
  occasion,
  style,
  finish,
  experienceLevel,
  selectedConcerns,
  products,
}: TutorialGenerationParams): TutorialStep[] {
  const steps: TutorialStep[] = []
  let stepCounter = 1

  const getProduct = (cat: ProductItem['category'], fallback: string) => {
    const found = products.find((p) => p.category === cat)
    return found ? `${found.brand} ${found.name}` : fallback
  }

  // 1. Skin Preparation
  if (experienceLevel === 'Beginner') {
    steps.push({
      stepNumber: stepCounter++,
      title: 'Skin Cleansing & Hydration',
      category: 'Skin Preparation',
      area: 'Entire face and neck',
      productName: 'Hydrating Face Moisturizer & Lip Balm',
      amount: 'Nickel-sized dollop for face; light swipe for lips',
      applicationInstructions:
        'Wash your face with lukewarm water and a gentle cleanser. Pat dry with a clean towel. Smooth hydrating moisturizer evenly across your forehead, cheeks, and neck.',
      blendingInstructions:
        'Massage in gentle upward circular motions. Let it soak into your skin for a full 2 to 3 minutes before touching any makeup.',
      mistakesToAvoid:
        'Applying makeup immediately over wet or greasy moisturizer, which will cause your foundation to slide right off.',
      proTip:
        'Prep your lips with balm now so they are soft and supple by the time you reach the lipstick step at the end.',
      completed: false,
    })
  } else if (experienceLevel === 'Intermediate') {
    steps.push({
      stepNumber: stepCounter++,
      title: 'Targeted Barrier Prep & Hydration Layering',
      category: 'Skin Preparation',
      area: 'T-zone, cheeks, and orbital hollows',
      productName: 'Hyaluronic Acid Essence + Emollient Barrier Cream',
      amount: '3 drops essence, pea-sized moisturizer',
      applicationInstructions:
        'Press lightweight hydrating essence into damp skin to plump epidermal cells. Follow with barrier cream concentrated on dry cheeks and smile folds.',
      blendingInstructions:
        'Press firmly with warm palms until tackiness subsides, ensuring an even hydration canvas without excess surface slip.',
      mistakesToAvoid:
        'Using heavy occlusive oils that break down silicone-based or water-based foundations.',
      proTip:
        'Blot the T-zone lightly with an oil-absorbing sheet before primer if you tend to produce midday shine.',
      completed: false,
    })
  } else {
    // Advanced
    steps.push({
      stepNumber: stepCounter++,
      title: 'Zone-Specific Dermal Prep & Lymphatic Drainage',
      category: 'Skin Preparation',
      area: 'Perimeters, jawline, and tear troughs',
      productName: 'Glycerin-Rich Hydrating Toner + Peptide Moisturizer',
      amount: 'Measured coin droplet',
      applicationInstructions:
        'Perform 60 seconds of upward lymphatic drainage strokes along the jawline and cheekbones using knuckle sweeps. Lock in with peptide moisturizer.',
      blendingInstructions:
        'Warm with fingertips and stipple into the stratum corneum until skin feels supple and grips fingers lightly.',
      mistakesToAvoid:
        'Over-hydrating the nasolabial folds, leading to smile-line product pooling under 4K video lenses.',
      proTip:
        'For high-definition photography, allow 4 minutes for epidermal absorption before laying down any film-forming primer.',
      completed: false,
    })
  }

  // 2. Primer
  const primerName = getProduct('Primer', 'Silky Smoothing Primer')
  if (experienceLevel === 'Beginner') {
    steps.push({
      stepNumber: stepCounter++,
      title: 'Smooth & Grip Primer',
      category: 'Primer',
      area: 'T-zone (forehead, nose, chin) and inner cheeks',
      productName: primerName,
      amount: 'Pea-sized amount',
      applicationInstructions:
        'Warm the primer between your two index fingers. Press it into your pores around your nose, forehead, and chin.',
      blendingInstructions:
        'Smooth outward toward the edge of your face. Do not rub aggressively; just press it smoothly so it fills in pores.',
      mistakesToAvoid: 'Using too much primer. A tiny pea-sized drop is enough for your entire face.',
      proTip: 'Wait 60 seconds after applying primer before putting on foundation.',
      completed: false,
    })
  } else if (experienceLevel === 'Intermediate') {
    steps.push({
      stepNumber: stepCounter++,
      title: 'Pore Blurring & Radiance Anchoring Primer',
      category: 'Primer',
      area: 'Central facial triangle and high cheekbones',
      productName: primerName,
      amount: 'One measured pump',
      applicationInstructions:
        'Stipple the primer directly into enlarged pores using pressing motions with synthetic bristles or fingers.',
      blendingInstructions:
        'Feather edges outward toward the hairline to create a seamless transition without balling or pilling.',
      mistakesToAvoid: 'Dragging primer in rapid back-and-forth motions, which lifts dead skin flakes.',
      proTip:
        finish === 'Matte'
          ? 'Focus oil-control primer strictly in the center T-zone while leaving outer cheek perimeters dewy.'
          : 'Apply illuminating primer on high cheekbones before base for an authentic lit-from-within glow.',
      completed: false,
    })
  } else {
    // Advanced
    steps.push({
      stepNumber: stepCounter++,
      title: 'Multi-Textured Priming & Surface Tension Lock',
      category: 'Primer',
      area: 'T-zone pore beds vs. cheek perimeters',
      productName: primerName,
      amount: 'Micro-dose per zone',
      applicationInstructions:
        'Target pore-filling elastomer precisely onto the sebaceous center. Apply gripping film-former along the cheek perimeter.',
      blendingInstructions:
        'Roll and press with a dense flat buffer brush to smooth dermal texture under directional wedding flashlights.',
      mistakesToAvoid: 'Mixing conflicting silicone and oil bases without adequate curing intervals.',
      proTip:
        'For heavy photography, check the surface reflectivity under direct flash on your phone camera before proceeding to base.',
      completed: false,
    })
  }

  // 3. Colour Correction (if selected or requested)
  if (selectedConcerns.length > 0) {
    const correctorName = getProduct('Colour Corrector', 'Pro Conceal HD Peach / Orange Corrector')
    steps.push({
      stepNumber: stepCounter++,
      title: 'Targeted Color Neutralization',
      category: 'Colour Corrector',
      area: 'Tear trough shadow, corners of mouth, and localized redness',
      productName: correctorName,
      amount: 'Pinhead micro-dots only',
      applicationInstructions:
        experienceLevel === 'Beginner'
          ? 'Dot a tiny speck of peach or orange corrector only where you see dark bluish circles or dark marks. Keep it very thin.'
          : 'Pinpoint application along the darkest vascular recession of the tear trough and perimeter hyperpigmentation.',
      blendingInstructions:
        experienceLevel === 'Beginner'
          ? 'Gently tap with the pad of your ring finger until the darkness looks neutral. Do not wipe it away.'
          : 'Stipple with a damp micro-sponge or synthetic flat concealer brush. Feather edges to zero opacity.',
      mistakesToAvoid:
        'Applying corrector all over the under-eye area. Only place it where discoloration is actually visible.',
      proTip:
        'Let the corrector set for 30 seconds to lock before stippling your foundation or concealer over it.',
      completed: false,
    })
  }

  // 4. Foundation
  const foundName = getProduct('Foundation', 'Liquid Medium-Buildable Foundation')
  steps.push({
    stepNumber: stepCounter++,
    title: `${style} Complexion Base Application`,
    category: 'Foundation',
    area: 'Center of face, diffusing outward to jawline and neck',
    productName: foundName,
    amount: experienceLevel === 'Beginner' ? '1 to 1.5 pumps' : '1 pump measured onto palette',
    applicationInstructions:
      experienceLevel === 'Beginner'
        ? 'Dot foundation on your forehead, cheeks, nose, and chin. Take a damp beauty sponge or soft brush and tap gently from the center of your face outward.'
        : experienceLevel === 'Intermediate'
        ? 'Deposit foundation on the back of your hand. Pick up thin layers with a damp sponge and bounce across the skin in overlapping stipples.'
        : 'Micro-layer foundation starting at the jawline perimeter, feathering sheer veil inward to preserve natural dermal translucency in the center.',
    blendingInstructions:
      'Always blend downward onto your jawline and slightly onto your neck so there is never a harsh dividing line between face and body.',
    mistakesToAvoid:
      'Rubbing or dragging the sponge across your face, which creates streaks and wipes away your primer.',
    proTip:
      finish === 'Radiant Glow' || finish === 'Natural Dewy'
        ? 'Dampen your makeup sponge with setting spray instead of plain water for extra dewy adhesion.'
        : 'Build coverage only where needed (center cheeks) while keeping the forehead and jaw sheer.',
    completed: false,
  })

  // 5. Concealer
  const concealName = getProduct('Concealer', 'Creamy Radiant Concealer')
  steps.push({
    stepNumber: stepCounter++,
    title: 'Brightening & Spot Concealing',
    category: 'Concealer',
    area: 'Inner corner of under-eyes, outer eye lift, and bridge of nose',
    productName: concealName,
    amount: 'Two tiny dots per eye',
    applicationInstructions:
      experienceLevel === 'Beginner'
        ? 'Place one dot near the inner corner under your eye, and one dot near the outer corner angling upward toward your temple for an instant lifted look.'
        : 'Apply precisely at the inner orbital socket and outer canthus angle. Dot directly on any remaining post-foundation blemishes.',
    blendingInstructions:
      'Press with a damp sponge tip or warm ring finger. Keep the product contained in the under-eye triangle; do not drag it down onto your cheeks.',
    mistakesToAvoid: 'Baking with excessive heavy concealer which cracks into smile lines.',
    proTip: 'Look upward while blending under the eyes to smooth out any natural creases before setting.',
    completed: false,
  })

  // 6. Setting Powder
  const powderName = getProduct('Setting Powder', 'Translucent Micro-Fine Loose Powder')
  steps.push({
    stepNumber: stepCounter++,
    title: 'Micro-Set & Shine Control',
    category: 'Setting Powder',
    area: 'Under-eyes, sides of nose, smile lines, and center forehead',
    productName: powderName,
    amount: 'Light dusting on powder puff',
    applicationInstructions:
      experienceLevel === 'Beginner'
        ? 'Dip a soft powder puff or fluffy brush into your translucent powder. Tap off the excess on the back of your hand, then gently press onto your under-eyes and T-zone.'
        : 'Work loose powder thoroughly into a velour puff, fold the puff in half to distribute evenly, and press firmly into high-mobility crease zones.',
    blendingInstructions:
      'Press and roll; never sweep harshly across wet concealer. Dust away excess with a clean, soft dome brush after 30 seconds.',
    mistakesToAvoid: 'Using too much white silica powder which causes severe white flashback in wedding flash photos.',
    proTip: 'Use a warm banana or golden translucent powder for warm South Asian and olive complexions.',
    completed: false,
  })

  // 7. Eye Makeup
  const eyeName = getProduct('Eyeshadow', 'Warm Neutrals Eyeshadow Palette')
  const linerName = getProduct('Eyeliner', 'Waterproof Gel Eyeliner & Mascara')
  steps.push({
    stepNumber: stepCounter++,
    title: `${style} Eye Definition & Lashes`,
    category: 'Eyeshadow',
    area: 'Crease, mobile lid, lash line, and lashes',
    productName: `${eyeName} + ${linerName}`,
    amount: 'Layered sheer pigments',
    applicationInstructions:
      experienceLevel === 'Beginner'
        ? '1) Sweep a soft warm brown shade into your crease. 2) Press champagne or gold shimmer onto the center of your eyelid with your finger. 3) Draw a thin line of black eyeliner close to your eyelashes. 4) Apply two coats of mascara.'
        : experienceLevel === 'Intermediate'
        ? '1) Map out the crease socket with a matte transition shade. 2) Deepen the outer-V with espresso or plum. 3) Foil metallic gold/bronze on the mobile lid using a damp flat brush. 4) Create a winged flick with gel liner. 5) Coat lashes with curling waterproof mascara.'
        : '1) Cut or halo the crease with sculpted transition geometry. 2) Lay down multidimensional duochrome crushed pearl on the apex. 3) Tightline upper waterline with waterproof kohl. 4) Winged liner with micro-tapered flick. 5) Layer individual lash clusters.',
    blendingInstructions:
      'Blend in small circular motions at the crease boundary until there are no harsh lines. Diffuse outer edges toward the brow tail.',
    mistakesToAvoid: 'Bringing dark shadow too high under the eyebrow arch, which closes off the eyes.',
    proTip: 'Wiggle the mascara wand right at the lash root before combing upward to maximize root volume.',
    completed: false,
  })

  // 8. Contour & Blush
  const blushName = getProduct('Blush', 'Silky Powder & Cream Blush')
  steps.push({
    stepNumber: stepCounter++,
    title: 'Facial Sculpting & Romantic Flush',
    category: 'Blush',
    area: 'Hollows beneath cheekbones, jawline, and upper cheek apples',
    productName: blushName,
    amount: 'Light swirl of brush',
    applicationInstructions:
      experienceLevel === 'Beginner'
        ? 'Smile softly. Place your blush on the upper part of your cheek apples and sweep upward toward your ears. Dust a little bronzer right under your cheekbones.'
        : 'Contour beneath the zygomatic cheekbone angling toward the ear tragus. Place blush high along the cheekbone arch, draping slightly into the temple for a youthful lift.',
    blendingInstructions:
      'Buff in upward, lifting strokes. Ensure the blush and contour blend together smoothly without two separate stripes.',
    mistakesToAvoid: 'Applying blush too close to the nose, which can make the face look flushed or narrow.',
    proTip: 'For long-lasting bridal events, layer a cream blush first, set with a sheer dusting of matching powder blush.',
    completed: false,
  })

  // 9. Highlighter
  const highName = getProduct('Highlighter', 'Champagne Metallic Highlighter')
  steps.push({
    stepNumber: stepCounter++,
    title: 'Strategic Radiant Illumination',
    category: 'Highlighter',
    area: 'High points of cheekbones, bridge of nose, and cupid\'s bow',
    productName: highName,
    amount: 'Soft touch on fan or tapered brush',
    applicationInstructions:
      'Sweep highlighter across the highest curve of your cheekbone where natural light reflects. Tap a micro-touch down the bridge of your nose and at the dip of your cupid’s bow.',
    blendingInstructions:
      'Buff softly in small circular strokes so the highlighter melts into the blush and looks like real, wet-look skin radiance rather than a streak of glitter.',
    mistakesToAvoid: 'Applying highlighter over enlarged skin pores or textured breakouts.',
    proTip: 'A tiny dab of highlighter in the inner tear ducts immediately wakes up tired eyes in photographs.',
    completed: false,
  })

  // 10. Lipstick
  const lipName = getProduct('Lipstick', 'Long-Wear Velvet Matte Lipstick')
  steps.push({
    stepNumber: stepCounter++,
    title: 'Precision Lip Contour & Long-Wear Fill',
    category: 'Lipstick',
    area: 'Vermilion border, cupid\'s bow, and full lip bed',
    productName: lipName,
    amount: 'One even layer',
    applicationInstructions:
      experienceLevel === 'Beginner'
        ? 'Trace your lips with a matching lip pencil first to prevent smudging. Fill in with your lipstick starting from the center of your lips moving outward.'
        : 'Sharpen your lip liner. Slightly overline the very peaks of your cupid\'s bow and center bottom curve for symmetry. Fill the body of the lips with your long-wear liquid lipstick.',
    blendingInstructions:
      'Press lips together once or soften the pencil border with a small detail brush before applying liquid color.',
    mistakesToAvoid: 'Overlining the outer mouth corners, which pulls the expression downward.',
    proTip: 'Blot with a thin tissue and dust a veil of translucent powder over the tissue to make your lip color 100% transfer-proof.',
    completed: false,
  })

  // 11. Setting Spray
  const sprayName = getProduct('Setting Spray', '16-Hour Lock Setting Mist')
  steps.push({
    stepNumber: stepCounter++,
    title: 'Melting Veil & 16-Hour Longevity Lock',
    category: 'Setting Spray',
    area: 'Full face in X and T motion',
    productName: sprayName,
    amount: '3 to 4 fine spritzes held 10 inches away',
    applicationInstructions:
      'Hold the setting spray about 10 to 12 inches away from your face. Close your eyes and mouth, and mist evenly in an "X" pattern across your face, followed by a "T" across forehead and nose.',
    blendingInstructions:
      'Do not touch or rub. Let the mist air dry naturally for 60 seconds. As it dries, it fuses all the powders and creams into one skin-like veil.',
    mistakesToAvoid: 'Holding the bottle too close, which can spray heavy water droplets that cause mascara or foundation to streak.',
    proTip: 'Fan your face gently with a notebook or hand fan while the mist sets for an ultra-fast flawless drydown.',
    completed: false,
  })

  return steps
}
