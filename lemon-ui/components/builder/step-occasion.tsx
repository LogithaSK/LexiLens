'use client'

import React, { useState } from 'react'
import {
  EventSettings,
  ExperienceLevel,
  FinishType,
  MakeupStyleType,
  OccasionType,
} from '../../lib/types/makeup'
import { Camera, ChevronDown, ChevronUp, Sparkles, Sun } from 'lucide-react'

interface StepOccasionProps {
  occasion: OccasionType
  setOccasion: (val: OccasionType) => void
  style: MakeupStyleType
  setStyle: (val: MakeupStyleType) => void
  finish: FinishType
  setFinish: (val: FinishType) => void
  experienceLevel: ExperienceLevel
  setExperienceLevel: (val: ExperienceLevel) => void
  eventSettings: EventSettings
  setEventSettings: React.Dispatch<React.SetStateAction<EventSettings>>
}

const OCCASIONS: OccasionType[] = [
  'Everyday',
  'Bridal',
  'Reception',
  'Engagement',
  'Party',
  'Festive',
  'Photoshoot',
]

const STYLES: { name: MakeupStyleType; desc: string }[] = [
  { name: 'Natural', desc: 'Fresh, skin-first, soft definition' },
  { name: 'Traditional', desc: 'Regal, kohl-rimmed, iconic bridal elegance' },
  { name: 'Soft Glam', desc: 'Refined neutral tones with champagne shimmer' },
  { name: 'Full Glam', desc: 'Sculpted contours, bold eyes, high-impact lips' },
  { name: 'Minimalist', desc: 'Clean, understated, monochromatic tint' },
  { name: 'Dewy Glass Skin', desc: 'High-luminosity moisture veil and wet-look shine' },
]

const FINISHES: FinishType[] = ['Satin', 'Matte', 'Radiant Glow', 'Natural Dewy']

const EXPERIENCE_LEVELS: { level: ExperienceLevel; label: string; desc: string }[] = [
  {
    level: 'Beginner',
    label: 'Beginner',
    desc: 'Clear, gentle steps, simple techniques, zero complex jargon.',
  },
  {
    level: 'Intermediate',
    label: 'Comfortable with Basics',
    desc: 'Focus on blending, product layering, and precise sculpting.',
  },
  {
    level: 'Advanced',
    label: 'Pro / Enthusiast',
    desc: 'High-definition finishing, micro-setting, and editorial symmetry.',
  },
]

export function StepOccasion({
  occasion,
  setOccasion,
  style,
  setStyle,
  finish,
  setFinish,
  experienceLevel,
  setExperienceLevel,
  eventSettings,
  setEventSettings,
}: StepOccasionProps) {
  const [showEventSettings, setShowEventSettings] = useState(false)

  return (
    <div className="builder-step-content" style={{ display: 'grid', gap: '26px' }}>
      {/* Occasion Selection */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            marginBottom: '10px',
            textTransform: 'uppercase',
          }}
        >
          1. What is the occasion?
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {OCCASIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setOccasion(item)}
              style={{
                padding: '10px 16px',
                border: occasion === item ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                background: occasion === item ? 'var(--ink)' : 'transparent',
                color: occasion === item ? 'var(--cream)' : 'var(--ink)',
                borderRadius: '30px',
                fontSize: '12px',
                fontWeight: occasion === item ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Desired Makeup Style */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            marginBottom: '10px',
            textTransform: 'uppercase',
          }}
        >
          2. Preferred Makeup Style & Mood
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
          }}
        >
          {STYLES.map(({ name, desc }) => {
            const isSelected = style === name
            return (
              <button
                key={name}
                type="button"
                onClick={() => setStyle(name)}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: isSelected ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  background: isSelected ? 'var(--yellow)' : 'var(--cream)',
                  boxShadow: isSelected ? '4px 4px 0 var(--ink)' : 'none',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <strong style={{ fontSize: '13px' }}>{name}</strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)', font: '11px var(--serif)' }}>
                  {desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Desired Finish */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            marginBottom: '10px',
            textTransform: 'uppercase',
          }}
        >
          3. Desired Complexion Finish
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {FINISHES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFinish(f)}
              style={{
                padding: '9px 15px',
                border: finish === f ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                background: finish === f ? 'var(--ink)' : 'var(--cream)',
                color: finish === f ? 'var(--cream)' : 'var(--ink)',
                fontSize: '12px',
                fontWeight: finish === f ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            marginBottom: '10px',
            textTransform: 'uppercase',
          }}
        >
          4. Your Makeup Experience Level
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
          }}
        >
          {EXPERIENCE_LEVELS.map(({ level, label, desc }) => {
            const isSelected = experienceLevel === level
            return (
              <button
                key={level}
                type="button"
                onClick={() => setExperienceLevel(level)}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: isSelected ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                  background: isSelected ? 'var(--yellow)' : 'var(--cream)',
                  boxShadow: isSelected ? '4px 4px 0 var(--ink)' : 'none',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800 }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  {desc}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Feature 11: Advanced Lighting and Event Settings Collapsible */}
      <div
        style={{
          border: '1px solid var(--line)',
          background: 'var(--cream)',
          padding: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => setShowEventSettings(!showEventSettings)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--ink)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sun size={16} />
              <strong style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Feature 11: Lighting & Event Atmosphere (Optional)
              </strong>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)', font: '12px var(--serif)' }}>
              Tune recommendations for venue lighting, flash photography, and outdoor endurance.
            </p>
          </div>
          {showEventSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showEventSettings && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--line)',
              display: 'grid',
              gap: '16px',
            }}
          >
            {/* Venue & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Venue Environment
                </label>
                <select
                  value={eventSettings.environment}
                  onChange={(e) =>
                    setEventSettings((prev) => ({
                      ...prev,
                      environment: e.target.value as any,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid var(--ink)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '12px',
                  }}
                >
                  <option value="Indoor">Indoor (AC / Ballroom)</option>
                  <option value="Outdoor">Outdoor (Garden / Lawn / Beach)</option>
                  <option value="Mixed">Mixed Indoor & Outdoor</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Time of Day
                </label>
                <select
                  value={eventSettings.timeOfDay}
                  onChange={(e) =>
                    setEventSettings((prev) => ({
                      ...prev,
                      timeOfDay: e.target.value as any,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid var(--ink)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '12px',
                  }}
                >
                  <option value="Daytime">Daytime</option>
                  <option value="Golden Hour">Golden Hour / Sunset</option>
                  <option value="Evening">Evening / Night</option>
                </select>
              </div>
            </div>

            {/* Lighting Tone */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Primary Venue Lighting
              </label>
              <select
                value={eventSettings.lighting}
                onChange={(e) =>
                  setEventSettings((prev) => ({
                    ...prev,
                    lighting: e.target.value as any,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--ink)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '12px',
                }}
              >
                <option value="Natural Sunlight">Natural Sunlight / Open Day</option>
                <option value="Warm Golden">Warm Golden Chandeliers / Fairy Lights</option>
                <option value="Cool LED">Cool White LED / Modern Studio</option>
                <option value="Dim Ambient">Dim Ambient / Candlelight</option>
              </select>
            </div>

            {/* Photography toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={eventSettings.photography}
                  onChange={(e) =>
                    setEventSettings((prev) => ({
                      ...prev,
                      photography: e.target.checked,
                    }))
                  }
                  style={{ accentColor: 'var(--ink)' }}
                />
                <strong>Professional DSLR / 4K Video Photography Planned</strong>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={eventSettings.flashPhotography}
                  onChange={(e) =>
                    setEventSettings((prev) => ({
                      ...prev,
                      flashPhotography: e.target.checked,
                    }))
                  }
                  style={{ accentColor: 'var(--ink)' }}
                />
                <strong>Heavy Flash Photography (Optimizes against white ghost flashback)</strong>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
