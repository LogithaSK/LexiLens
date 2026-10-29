'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Heart,
  Moon,
  ShoppingBag,
  Sparkles,
  Sun,
  WandSparkles,
} from 'lucide-react'

// Sub-components
import { StepOccasion } from './builder/step-occasion'
import { StepOutfit } from './builder/step-outfit'
import { StepTryon } from './builder/step-tryon'
import { StepConcerns } from './builder/step-concerns'
import { StepTutorial } from './builder/step-tutorial'
import { StepProducts } from './builder/step-products'
import { PersonalKitModal } from './inventory/personal-kit-modal'
import { SavedLooksModal } from './saved-looks/saved-looks-modal'
import { LemonHelpModal } from './help/lemon-help-modal'

// Types & Services
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
  SavedLookRecord,
} from '../lib/types/makeup'
import { recommendMakeupLook, UserPreferencesInput } from '../lib/services/recommendation-engine'
import {
  getPersonalKit,
  getSavedLooks,
  saveLookToStorage,
} from '../lib/services/storage-service'
import { FALLBACK_PALETTE } from '../lib/services/color-extractor'

const BUILDER_STEPS = [
  'Occasion & Mood',
  'Attire & Colors',
  'Face & Try-On',
  'Correction Guide',
  'Step Tutorial',
  'Products & Budget',
]

const CURATED_LOOKS: {
  title: string
  meta: string
  tone: string
  image: string
  occasion: OccasionType
  style: MakeupStyleType
  finish: FinishType
}[] = [
  {
    title: 'Soft focus',
    meta: 'Everyday · Satin',
    tone: 'look-peach',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dead2a0e?auto=format&fit=crop&w=900&q=85',
    occasion: 'Everyday',
    style: 'Natural',
    finish: 'Satin',
  },
  {
    title: 'Golden hour',
    meta: 'Evening · Glowy',
    tone: 'look-gold',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85',
    occasion: 'Evening',
    style: 'Soft Glam',
    finish: 'Radiant Glow',
  },
  {
    title: 'Modern bride',
    meta: 'Bridal · Luminous',
    tone: 'look-rose',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85',
    occasion: 'Bridal',
    style: 'Traditional',
    finish: 'Satin',
  },
  {
    title: 'Royal Sangeet',
    meta: 'Party · High Impact',
    tone: 'look-gold',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85',
    occasion: 'Party',
    style: 'Full Glam',
    finish: 'Radiant Glow',
  },
  {
    title: 'Dewy Glass Skin',
    meta: 'Festive · Luminous',
    tone: 'look-peach',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dead2a0e?auto=format&fit=crop&w=900&q=85',
    occasion: 'Festive',
    style: 'Dewy Glass Skin',
    finish: 'Natural Dewy',
  },
  {
    title: 'Editorial Noir',
    meta: 'Photoshoot · Matte',
    tone: 'look-rose',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85',
    occasion: 'Photoshoot',
    style: 'Full Glam',
    finish: 'Matte',
  },
]

export function LemonApp() {
  const [dark, setDark] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [occasion, setOccasion] = useState<OccasionType>('Everyday')
  const [style, setStyle] = useState<MakeupStyleType>('Natural')
  const [finish, setFinish] = useState<FinishType>('Satin')
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Beginner')
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('mid-range')
  const [customBudget, setCustomBudget] = useState<number>(4500)
  const [selectedOutfitColor, setSelectedOutfitColor] = useState<ExtractedColor>(FALLBACK_PALETTE[0])
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [userFaceImage, setUserFaceImage] = useState<string | null>(null)

  // Cosmetic interactive try-on states
  const [lipstickColor, setLipstickColor] = useState('#A81C28')
  const [blushColor, setBlushColor] = useState('#E68A7E')
  const [eyeshadowColor, setEyeshadowColor] = useState('#D4AF37')

  // Event settings (Feature 11)
  const [eventSettings, setEventSettings] = useState<EventSettings>({
    environment: 'Indoor',
    timeOfDay: 'Daytime',
    lighting: 'Natural Sunlight',
    photography: false,
    flashPhotography: false,
  })

  // Storage and modal states
  const [ownedProductIds, setOwnedProductIds] = useState<string[]>([])
  const [isKitModalOpen, setIsKitModalOpen] = useState(false)
  const [isSavedLooksModalOpen, setIsSavedLooksModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load owned products and saved look counts from storage
  useEffect(() => {
    const kit = getPersonalKit()
    setOwnedProductIds(kit.map((k) => k.id))
  }, [isKitModalOpen])

  // Build the live recommended look
  const currentRecommendation = useMemo(() => {
    const input: UserPreferencesInput = {
      occasion,
      style,
      finish,
      experienceLevel,
      budgetTier,
      customBudget: budgetTier === 'custom' ? customBudget : undefined,
      selectedOutfitColor,
      eventSettings,
      selectedConcerns,
    }
    return recommendMakeupLook(input)
  }, [
    occasion,
    style,
    finish,
    experienceLevel,
    budgetTier,
    customBudget,
    selectedOutfitColor,
    eventSettings,
    selectedConcerns,
  ])

  // Active products in the routine
  const [currentProducts, setCurrentProducts] = useState<ProductItem[]>(
    currentRecommendation.products
  )

  // Sync products when recommendation fundamentally changes
  useEffect(() => {
    setCurrentProducts(currentRecommendation.products)
  }, [currentRecommendation.id, currentRecommendation.products.length])

  // Active tutorial steps (with completion toggle)
  const [tutorialSteps, setTutorialSteps] = useState(currentRecommendation.tutorial)

  useEffect(() => {
    setTutorialSteps(currentRecommendation.tutorial)
  }, [currentRecommendation.tutorial])

  const handleStepCompleteToggle = (stepNumber: number) => {
    setTutorialSteps((prev) =>
      prev.map((step) =>
        step.stepNumber === stepNumber ? { ...step, completed: !step.completed } : step
      )
    )
  }

  // Save look handler (Feature 12)
  const handleSaveCurrentLook = () => {
    saveLookToStorage({
      name: `${occasion} ${style} Routine`,
      occasion,
      style,
      look: {
        ...currentRecommendation,
        products: currentProducts,
        tutorial: tutorialSteps,
      },
      budgetTier,
      customBudget: budgetTier === 'custom' ? customBudget : undefined,
    })
    showToast(`✓ "${occasion} ${style} Routine" saved to your collection!`)
  }

  // Load a saved look
  const handleLoadSavedRecord = (record: SavedLookRecord) => {
    setOccasion(record.occasion)
    setStyle(record.style)
    setFinish(record.look.finish)
    if (record.budgetTier) setBudgetTier(record.budgetTier)
    if (record.customBudget) setCustomBudget(record.customBudget)
    setCurrentProducts(record.look.products)
    setTutorialSteps(record.look.tutorial)
    setActiveStep(4) // jump to tutorial
    showToast(`Loaded routine: ${record.name}`)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const filteredCuratedLooks = CURATED_LOOKS.filter((item) =>
    occasion === 'Everyday' ? true : item.occasion === occasion
  )

  const handleSelectCuratedLook = (item: (typeof CURATED_LOOKS)[0]) => {
    setOccasion(item.occasion)
    setStyle(item.style)
    setFinish(item.finish)
    setActiveStep(2) // Jump to Face & Try-On
    const el = document.getElementById('builder')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    showToast(`Selected "${item.title}" — ready for virtual try-on!`)
  }

  return (
    <main className={`lemon-app ${dark ? 'dark-mode' : ''}`} id="top">
      {/* Lemon Corner Motifs */}
      <div className="lemon-corner lemon-corner-top" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="lemon-corner lemon-corner-bottom" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--ink)',
            color: 'var(--yellow)',
            padding: '12px 20px',
            border: '2px solid var(--yellow)',
            boxShadow: '6px 6px 0 rgba(0,0,0,0.3)',
            zIndex: 999,
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Site Header */}
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Lemon home">
          <span className="brand-mark">
            <span />
          </span>
          <span className="brand-name">Lemon</span>
        </a>

        <nav className="header-nav" aria-label="Main navigation">
          <a href="#discover">Discover looks</a>
          <a href="#how-it-works">How it works</a>
          <a href="#studio">Bridal studio</a>

          {/* Feature 10 Header Button: Personal Kit */}
          <button
            type="button"
            onClick={() => setIsKitModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              border: '1.5px solid var(--ink)',
              background: 'var(--cream)',
              color: 'var(--ink)',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <ShoppingBag size={14} /> My Kit ({ownedProductIds.length})
          </button>

          {/* Feature 12 Header Button: Saved Looks */}
          <button
            type="button"
            onClick={() => setIsSavedLooksModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              border: '1.5px solid var(--ink)',
              background: 'var(--yellow)',
              color: 'var(--ink)',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <BookOpen size={14} /> Saved Looks
          </button>

          {/* Help Button */}
          <button
            className="help-button"
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            aria-label="Help and Architecture info"
          >
            <CircleHelp size={18} />
          </button>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setDark(!dark)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </nav>
      </header>

      <div className="page-wrap">
        {/* Hero Section */}
        <section className="hero-grid">
          <div className="intro-row">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> PERSONALIZED BEAUTY, MADE SIMPLE
            </div>
            <h1>
              Your face.
              <br />
              <em>Your style.</em>
              <br />
              Your perfect look.
            </h1>
            <p className="intro-copy">
              A thoughtful makeup guide that starts with you — your features, your occasion, your attire, and your version of beautiful.
            </p>
            <div className="hero-actions">
              <a className="continue-button" href="#builder">
                Create my look <ArrowRight size={17} />
              </a>
              <a className="text-link" href="#discover">
                Explore looks <ArrowRight size={15} />
              </a>
            </div>
          </div>

          <div className="hero-art" aria-label="Bridal makeup inspiration">
            <img
              className="hero-bridal-image"
              src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=90"
              alt="Bride wearing an elegant makeup look"
            />
            <div className="hero-circle" />
            <div className="hero-card">
              <span className="hero-card-label">LEMON BEAUTY NOTE</span>
              <strong>
                Glow softly.
                <br />
                <em>Be fully you.</em>
              </strong>
              <span className="hero-card-line" />
            </div>
            <div className="hero-lip" />
            <div className="hero-caption">
              01 / A LOOK FOR
              <br />
              YOUR EVERYDAY
            </div>
          </div>
        </section>

        {/* Personalized Makeup Builder Card */}
        <section className="builder-card" id="builder" aria-label="Personalized makeup builder">
          {/* Progress Panel on Left */}
          <aside className="progress-panel">
            <div>
              <div className="progress-kicker">LET&apos;S GET STARTED</div>
              <h2>
                Build your
                <br />
                signature look
              </h2>
              <p>We&apos;ll guide you one easy step at a time.</p>
            </div>

            <div className="steps-list">
              {BUILDER_STEPS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={`step ${activeStep === index ? 'active' : ''}`}
                  onClick={() => setActiveStep(index)}
                >
                  <span className="step-number">
                    {index < activeStep ? <Check size={13} /> : `0${index + 1}`}
                  </span>
                  <span>{label}</span>
                  {activeStep === index && <ArrowRight size={15} />}
                </button>
              ))}
            </div>

            <div className="privacy-note">
              <span className="privacy-icon">✦</span>
              <span>
                Your photos stay private
                <br />
                and are never used to train AI.
              </span>
            </div>
          </aside>

          {/* Builder Content on Right */}
          <div className="builder-content">
            <div className="content-topline">
              <span>
                STEP 0{activeStep + 1} OF 0{BUILDER_STEPS.length}
              </span>
              <span>
                {activeStep <= 2 ? 'EST. 2 MINUTES' : 'RECOMMENDATION ACTIVE'}
              </span>
            </div>

            <div style={{ marginTop: '20px' }}>
              {/* Step 0: Occasion & Preferences & Event Settings */}
              {activeStep === 0 && (
                <StepOccasion
                  occasion={occasion}
                  setOccasion={setOccasion}
                  style={style}
                  setStyle={setStyle}
                  finish={finish}
                  setFinish={setFinish}
                  experienceLevel={experienceLevel}
                  setExperienceLevel={setExperienceLevel}
                  eventSettings={eventSettings}
                  setEventSettings={setEventSettings}
                />
              )}

              {/* Step 1: Attire & Colors (Feature 3) */}
              {activeStep === 1 && (
                <StepOutfit
                  occasion={occasion}
                  style={style}
                  selectedColor={selectedOutfitColor}
                  setSelectedColor={setSelectedOutfitColor}
                />
              )}

              {/* Step 2: Face & Try-On (Feature 1 & Feature 5) */}
              {activeStep === 2 && (
                <StepTryon
                  userImage={userFaceImage}
                  setUserImage={setUserFaceImage}
                  lipstickColor={lipstickColor}
                  setLipstickColor={setLipstickColor}
                  blushColor={blushColor}
                  setBlushColor={setBlushColor}
                  eyeshadowColor={eyeshadowColor}
                  setEyeshadowColor={setEyeshadowColor}
                />
              )}

              {/* Step 3: Skin Concern & Colour Correction (Feature 4) */}
              {activeStep === 3 && (
                <StepConcerns
                  selectedConcerns={selectedConcerns}
                  setSelectedConcerns={setSelectedConcerns}
                />
              )}

              {/* Step 4: Step-by-Step Tutorial (Feature 6) */}
              {activeStep === 4 && (
                <StepTutorial
                  look={{
                    ...currentRecommendation,
                    products: currentProducts,
                    tutorial: tutorialSteps,
                  }}
                  experienceLevel={experienceLevel}
                  setExperienceLevel={setExperienceLevel}
                  onStepCompleteToggle={handleStepCompleteToggle}
                />
              )}

              {/* Step 5: Product Recommendations & Budget Shopping List (Features 7, 8, 9, 10) */}
              {activeStep === 5 && (
                <StepProducts
                  look={{
                    ...currentRecommendation,
                    products: currentProducts,
                    tutorial: tutorialSteps,
                  }}
                  budgetTier={budgetTier}
                  setBudgetTier={setBudgetTier}
                  customBudget={customBudget}
                  setCustomBudget={setCustomBudget}
                  products={currentProducts}
                  setProducts={setCurrentProducts}
                  ownedProductIds={ownedProductIds}
                  setOwnedProductIds={setOwnedProductIds}
                  onOpenPersonalKit={() => setIsKitModalOpen(true)}
                  onSaveLook={handleSaveCurrentLook}
                />
              )}
            </div>

            {/* Back / Continue Buttons */}
            <div className="content-actions" style={{ marginTop: '32px' }}>
              <button
                className="back-button"
                type="button"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                style={{ opacity: activeStep === 0 ? 0.4 : 1, cursor: activeStep === 0 ? 'default' : 'pointer' }}
              >
                Back
              </button>

              <button
                className="continue-button"
                type="button"
                onClick={() => {
                  if (activeStep < BUILDER_STEPS.length - 1) {
                    setActiveStep(activeStep + 1)
                  } else {
                    handleSaveCurrentLook()
                  }
                }}
              >
                {activeStep < BUILDER_STEPS.length - 1 ? (
                  <>
                    Continue to {BUILDER_STEPS[activeStep + 1]} <ArrowRight size={17} />
                  </>
                ) : (
                  <>
                    Save Routine & Complete <Check size={17} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Discover Looks Section */}
        <section className="occasion-section" id="discover">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" /> FIND YOUR FINISH
            </div>
            <h2>
              Made for the
              <br />
              <em>moment.</em>
            </h2>
          </div>
          <div className="occasion-pills">
            {['Everyday', 'Bridal', 'Party', 'Festive', 'Evening'].map((item) => (
              <button
                key={item}
                className={occasion === item ? 'selected' : ''}
                type="button"
                onClick={() => {
                  setOccasion(item as OccasionType)
                  const el = document.getElementById('discover')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Curated Looks Grid */}
        <section className="looks-grid">
          <div className="section-heading">
            <div>
              <span className="section-number">02 /</span>
              <h2>Looks that feel like you.</h2>
            </div>
            <a className="text-link" href="#builder">
              Build custom look <ArrowRight size={15} />
            </a>
          </div>

          <div className="look-cards">
            {filteredCuratedLooks.map((look, index) => (
              <article
                className={`look-card ${look.tone}`}
                key={look.title}
                onClick={() => handleSelectCuratedLook(look)}
                style={{ cursor: 'pointer' }}
              >
                <div className="look-visual">
                  <img
                    src={look.image}
                    alt={`${look.title} makeup inspiration`}
                    loading="lazy"
                  />
                  <span className="visual-shape" />
                  <span className="visual-face" />
                  <button
                    type="button"
                    className="save-button"
                    aria-label={`Save ${look.title}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      saveLookToStorage({
                        name: look.title,
                        occasion: look.occasion,
                        style: look.style,
                        look: recommendMakeupLook({
                          occasion: look.occasion,
                          style: look.style,
                          finish: look.finish,
                          experienceLevel,
                          budgetTier,
                          eventSettings,
                          selectedConcerns,
                        }),
                        budgetTier,
                      })
                      showToast(`Saved "${look.title}" to your saved looks!`)
                    }}
                  >
                    <Heart size={17} />
                  </button>
                  <span className="visual-label">0{index + 1}</span>
                </div>
                <div className="look-info">
                  <div>
                    <h3>{look.title}</h3>
                    <p>{look.meta}</p>
                  </div>
                  <ArrowRight size={17} />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-section" id="how-it-works">
          <div className="how-copy">
            <span className="section-number">03 / THE LEMON METHOD</span>
            <h2>
              Less guesswork.
              <br />
              <em>More you.</em>
            </h2>
            <p>
              From first inspiration to final brushstroke, Lemon keeps your routine personal, practical, and easy to recreate in real life.
            </p>
            <a className="continue-button" href="#builder">
              Start your journey <ArrowRight size={17} />
            </a>
          </div>
          <div className="method-list">
            {[
              'Tell us the moment & lighting',
              'Extract harmony from your attire',
              'See your soft preview & face map',
              'Learn every step within your budget',
            ].map((item, index) => (
              <div className="method-item" key={item}>
                <span>0{index + 1}</span>
                <strong>{item}</strong>
                <Check size={15} />
              </div>
            ))}
          </div>
        </section>

        {/* Bridal Studio Banner */}
        <section className="studio-banner" id="studio">
          <div>
            <span className="section-number">LEMON BRIDAL STUDIO</span>
            <h2>
              Your aisle-side
              <br />
              <em>beauty editor.</em>
            </h2>
            <p>
              Outfit-aware inspiration, calm tutorials, and a look that lasts from first photo to last dance.
            </p>
          </div>
          <button
            className="dark-button"
            type="button"
            onClick={() => {
              setOccasion('Bridal')
              setStyle('Traditional')
              setActiveStep(0)
              const el = document.getElementById('builder')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
              showToast('Bridal Studio activated! Let’s build your bridal look.')
            }}
            style={{ cursor: 'pointer', border: '1.5px solid var(--ink)' }}
          >
            Explore bridal studio <ArrowRight size={17} />
          </button>
        </section>

        {/* Feature Strip */}
        <section className="feature-strip">
          <div>
            <span className="strip-icon">
              <Sparkles size={18} />
            </span>
            <strong>Personalized, not prescriptive.</strong>
            <span>Every recommendation starts with you.</span>
          </div>
          <div>
            <span className="strip-icon">
              <Sun size={18} />
            </span>
            <strong>Looks good in real life.</strong>
            <span>Guidance for your lighting, your day.</span>
          </div>
          <div>
            <span className="strip-icon">
              <Check size={18} />
            </span>
            <strong>Always within reach.</strong>
            <span>Options for every budget and skill level.</span>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer>
        <span>LEMON / YOUR PERSONALIZED MAKEUP GUIDE</span>
        <span>Made for your good days.</span>
      </footer>

      {/* Modals */}
      <PersonalKitModal
        isOpen={isKitModalOpen}
        onClose={() => setIsKitModalOpen(false)}
        onKitUpdated={() => {
          const kit = getPersonalKit()
          setOwnedProductIds(kit.map((k) => k.id))
        }}
      />

      <SavedLooksModal
        isOpen={isSavedLooksModalOpen}
        onClose={() => setIsSavedLooksModalOpen(false)}
        onLoadLook={handleLoadSavedRecord}
      />

      <LemonHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </main>
  )
}
