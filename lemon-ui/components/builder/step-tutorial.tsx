'use client'

import React, { useState } from 'react'
import { ExperienceLevel, RecommendedLook, TutorialStep } from '../../lib/types/makeup'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react'

interface StepTutorialProps {
  look: RecommendedLook
  experienceLevel: ExperienceLevel
  setExperienceLevel: (lvl: ExperienceLevel) => void
  onStepCompleteToggle: (stepNumber: number) => void
}

export function StepTutorial({
  look,
  experienceLevel,
  setExperienceLevel,
  onStepCompleteToggle,
}: StepTutorialProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  const steps = look.tutorial || []
  const currentStep: TutorialStep | undefined = steps[activeStepIndex] || steps[0]

  const completedCount = steps.filter((s) => s.completed).length
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0

  const handleNext = () => {
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1)
    }
  }

  const handlePrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1)
    }
  }

  return (
    <div className="builder-step-content" style={{ display: 'grid', gap: '24px' }}>
      {/* Header & Look Overview */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            FEATURE 6: STEP-BY-STEP MAKEUP MASTERCLASS
          </span>
          <h3 style={{ margin: '4px 0 6px', fontSize: '28px', fontFamily: 'var(--serif)' }}>
            Recreating Your Look: {look.name}
          </h3>
          <p style={{ margin: 0, color: 'var(--muted)', font: '14px var(--serif)' }}>
            {look.suitabilityRationale}
          </p>
        </div>

        {/* Depth Mode Selector (Beginner / Intermediate / Advanced) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Tutorial Depth Mode:
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setExperienceLevel(lvl)}
                style={{
                  padding: '6px 12px',
                  border: experienceLevel === lvl ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  background: experienceLevel === lvl ? 'var(--ink)' : 'var(--cream)',
                  color: experienceLevel === lvl ? 'var(--cream)' : 'var(--ink)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar & Quick Stats */}
      <div
        style={{
          border: '1.5px solid var(--ink)',
          background: 'var(--cream)',
          padding: '16px 20px',
          boxShadow: '4px 4px 0 var(--yellow)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>
              Step {currentStep?.stepNumber || 1} of {steps.length}: {currentStep?.title}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={13} /> Est. {look.estimatedTimeMinutes} min total
            </span>
          </div>

          <span style={{ fontSize: '11px', fontWeight: 800 }}>
            {completedCount} / {steps.length} Completed ({progressPercent}%)
          </span>
        </div>

        {/* Progress track */}
        <div
          style={{
            width: '100%',
            height: '8px',
            background: 'var(--line)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'var(--ink)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Step Numbers Pill Carousel */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingTop: '14px',
            marginTop: '10px',
            borderTop: '1px solid var(--line)',
          }}
        >
          {steps.map((st, idx) => {
            const isActive = idx === activeStepIndex
            return (
              <button
                key={st.stepNumber}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  border: isActive ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  background: isActive ? 'var(--yellow)' : st.completed ? 'var(--cream)' : 'transparent',
                  color: 'var(--ink)',
                  fontSize: '11px',
                  fontWeight: isActive ? 800 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  borderRadius: '20px',
                }}
              >
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: st.completed ? 'var(--ink)' : 'transparent',
                    color: st.completed ? 'var(--yellow)' : 'inherit',
                    border: '1px solid currentColor',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '9px',
                  }}
                >
                  {st.completed ? <Check size={11} /> : st.stepNumber}
                </span>
                <span>{st.category}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Step Dedicated Instruction Card */}
      {currentStep && (
        <div
          style={{
            border: '1.5px solid var(--ink)',
            background: 'var(--cream)',
            padding: '28px',
            boxShadow: '8px 8px 0 var(--yellow)',
            display: 'grid',
            gap: '20px',
          }}
        >
          {/* Card Topline */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '14px',
              gap: '10px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: 'var(--muted)',
                }}
              >
                STEP {currentStep.stepNumber.toString().padStart(2, '0')} · {currentStep.category.toUpperCase()}
              </span>
              <h2 style={{ margin: '2px 0 0', fontSize: '30px', fontFamily: 'var(--serif)' }}>
                {currentStep.title}
              </h2>
            </div>

            {/* Mark as Completed Button */}
            <button
              type="button"
              onClick={() => onStepCompleteToggle(currentStep.stepNumber)}
              style={{
                padding: '9px 18px',
                background: currentStep.completed ? 'var(--ink)' : 'transparent',
                color: currentStep.completed ? 'var(--yellow)' : 'var(--ink)',
                border: '1.5px solid var(--ink)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              {currentStep.completed ? 'Completed ✓' : 'Mark Step as Done'}
            </button>
          </div>

          {/* Grid of Step Details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px',
            }}
          >
            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Product Required:
              </strong>
              <p style={{ margin: '4px 0 0', font: '15px/1.4 var(--serif)', fontWeight: 600 }}>
                {currentStep.productName}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Target Facial Area:
              </strong>
              <p style={{ margin: '4px 0 0', font: '14px var(--serif)' }}>
                {currentStep.area}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Dosage & Amount:
              </strong>
              <p style={{ margin: '4px 0 0', font: '14px var(--serif)' }}>
                {currentStep.amount}
              </p>
            </div>
          </div>

          {/* Application Instructions */}
          <div
            style={{
              padding: '16px',
              border: '1px solid var(--line)',
              background: 'var(--paper)',
            }}
          >
            <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              How to Apply:
            </strong>
            <p style={{ margin: '6px 0 0', font: '15px/1.55 var(--serif)', color: 'var(--ink)' }}>
              {currentStep.applicationInstructions}
            </p>
          </div>

          {/* Blending Instructions */}
          <div
            style={{
              padding: '16px',
              border: '1px solid var(--line)',
              background: 'var(--paper)',
            }}
          >
            <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              How to Blend & Melt:
            </strong>
            <p style={{ margin: '6px 0 0', font: '15px/1.55 var(--serif)', color: 'var(--ink)' }}>
              {currentStep.blendingInstructions}
            </p>
          </div>

          {/* Common Mistakes & Pro Tip Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div
              style={{
                background: '#FFF8F8',
                border: '1px solid #FFCDD2',
                padding: '14px 16px',
              }}
            >
              <strong style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', color: '#C62828' }}>
                <AlertTriangle size={15} /> Common Mistakes to Avoid:
              </strong>
              <p style={{ margin: '6px 0 0', font: '13px var(--serif)', color: '#444' }}>
                {currentStep.mistakesToAvoid}
              </p>
            </div>

            <div
              style={{
                background: 'rgba(244, 216, 74, 0.3)',
                border: '1px solid var(--ink)',
                padding: '14px 16px',
              }}
            >
              <strong style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} /> Professional Bridal Tip:
              </strong>
              <p style={{ margin: '6px 0 0', font: '13px var(--serif)' }}>
                {currentStep.proTip}
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid var(--line)',
            }}
          >
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeStepIndex === 0}
              style={{
                padding: '10px 18px',
                background: 'transparent',
                border: '1px solid var(--ink)',
                color: activeStepIndex === 0 ? 'var(--muted)' : 'var(--ink)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: activeStepIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ArrowLeft size={16} /> Previous Step
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={activeStepIndex === steps.length - 1}
              style={{
                padding: '10px 20px',
                background: 'var(--ink)',
                border: '1.5px solid var(--ink)',
                color: 'var(--cream)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: activeStepIndex === steps.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
