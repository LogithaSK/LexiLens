'use client'

import React, { useState } from 'react'
import { COLOR_CORRECTION_GUIDES } from '../../lib/data/color-correction-guide'
import { SkinConcernGuide } from '../../lib/types/makeup'
import { AlertTriangle, Check, Info, Sparkles, X } from 'lucide-react'

interface StepConcernsProps {
  selectedConcerns: string[]
  setSelectedConcerns: React.Dispatch<React.SetStateAction<string[]>>
}

export function StepConcerns({ selectedConcerns, setSelectedConcerns }: StepConcernsProps) {
  const [activeConcernDetail, setActiveConcernDetail] = useState<SkinConcernGuide>(
    COLOR_CORRECTION_GUIDES[0]
  )

  const toggleConcern = (id: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="builder-step-content" style={{ display: 'grid', gap: '24px' }}>
      <div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          FEATURE 4: EDUCATIONAL COLOUR-CORRECTION GUIDE
        </span>
        <h3 style={{ margin: '4px 0 6px', fontSize: '26px', fontFamily: 'var(--serif)' }}>
          Targeted Color-Correction & Balance
        </h3>
        <p style={{ margin: 0, color: 'var(--muted)', font: '14px var(--serif)' }}>
          Colour correction uses chromatic opposites on the color wheel to optically neutralize shadows and redness before foundation.
        </p>
      </div>

      {/* Non-diagnostic Disclaimer Alert */}
      <div
        style={{
          background: 'rgba(244, 216, 74, 0.25)',
          border: '1.5px solid var(--ink)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Non-Diagnostic Educational Guidance:
          </strong>
          <p style={{ margin: '2px 0 0', font: '13px var(--serif)', color: 'var(--ink)' }}>
            Colour correction is completely optional. Lemon provides cosmetic makeup guidance only and does not diagnose skin conditions or medical health. Select only concerns you wish to cosmetically balance.
          </p>
        </div>
      </div>

      {/* Concerns Selector Grid */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '10px',
            textTransform: 'uppercase',
          }}
        >
          Select Any Areas You Want Educational Correction For (or skip if not needed):
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {COLOR_CORRECTION_GUIDES.map((guide) => {
            const isChecked = selectedConcerns.includes(guide.id)
            return (
              <div
                key={guide.id}
                onClick={() => {
                  toggleConcern(guide.id)
                  setActiveConcernDetail(guide)
                }}
                style={{
                  padding: '12px',
                  border: isChecked ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  background: isChecked ? 'var(--yellow)' : 'var(--cream)',
                  boxShadow: isChecked ? '4px 4px 0 var(--ink)' : 'none',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: guide.colorHex,
                    border: '1px solid var(--ink)',
                    flexShrink: 0,
                    marginTop: '2px',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {isChecked && <Check size={12} color="#000" />}
                </div>
                <div>
                  <strong style={{ fontSize: '12px', display: 'block' }}>{guide.name}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', font: '11px var(--serif)' }}>
                    Corrector: {guide.suggestedCorrector.split('for')[0]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Educational Guide for Selected Concern */}
      {activeConcernDetail && (
        <div
          style={{
            border: '1.5px solid var(--ink)',
            background: 'var(--cream)',
            padding: '24px',
            boxShadow: '6px 6px 0 var(--yellow)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: 'var(--muted)',
                }}
              >
                TECHNIQUE BREAKDOWN
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: '22px', fontFamily: 'var(--serif)' }}>
                {activeConcernDetail.name}
              </h3>
            </div>
            <span
              style={{
                padding: '4px 10px',
                background: activeConcernDetail.colorHex,
                border: '1px solid var(--ink)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#1c1b16',
              }}
            >
              {activeConcernDetail.isNecessary}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px',
            }}
          >
            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                1. Suggested Corrector Colour:
              </strong>
              <p style={{ margin: '4px 0 0', font: '14px var(--serif)' }}>
                {activeConcernDetail.suggestedCorrector}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                2. Target Facial Area:
              </strong>
              <p style={{ margin: '4px 0 0', font: '14px var(--serif)' }}>
                {activeConcernDetail.targetArea}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                3. Approximate Amount Needed:
              </strong>
              <p style={{ margin: '4px 0 0', font: '14px var(--serif)' }}>
                {activeConcernDetail.approximateAmount}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                4. Application & Blending Technique:
              </strong>
              <p style={{ margin: '4px 0 0', font: '14px var(--serif)' }}>
                {activeConcernDetail.applicationTechnique} {activeConcernDetail.blendingInstructions}
              </p>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                5. What to Apply Afterward:
              </strong>
              <p style={{ margin: '4px 0 0', font: '14px var(--serif)' }}>
                {activeConcernDetail.subsequentStep}
              </p>
            </div>

            <div
              style={{
                gridColumn: '1 / -1',
                background: '#FFFBEA',
                border: '1px solid #E6D080',
                padding: '12px 14px',
              }}
            >
              <strong style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} color="#B45309" /> Common Mistakes to Avoid:
              </strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: '18px', font: '13px var(--serif)' }}>
                {activeConcernDetail.commonMistakes.map((mistake, idx) => (
                  <li key={idx}>{mistake}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
