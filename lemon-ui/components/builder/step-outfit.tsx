'use client'

import React, { useRef, useState } from 'react'
import {
  extractDominantColorsFromImage,
  FALLBACK_PALETTE,
  generateOutfitMakeupHarmony,
  MANUAL_SWATCHES,
  OutfitMakeupHarmony,
} from '../../lib/services/color-extractor'
import { ExtractedColor, MakeupStyleType, OccasionType } from '../../lib/types/makeup'
import { Check, Palette, Sparkles, Upload, X } from 'lucide-react'

interface StepOutfitProps {
  occasion: OccasionType
  style: MakeupStyleType
  selectedColor?: ExtractedColor
  setSelectedColor: (color: ExtractedColor) => void
}

export function StepOutfit({
  occasion,
  style,
  selectedColor,
  setSelectedColor,
}: StepOutfitProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [outfitPreviewUrl, setOutfitPreviewUrl] = useState<string | null>(null)
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>(FALLBACK_PALETTE)
  const [isExtracting, setIsExtracting] = useState(false)
  const [harmony, setHarmony] = useState<OutfitMakeupHarmony>(() =>
    generateOutfitMakeupHarmony(selectedColor || FALLBACK_PALETTE[0], occasion, style)
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).')
      return
    }

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setOutfitPreviewUrl(dataUrl)
      setIsExtracting(true)
      try {
        const colors = await extractDominantColorsFromImage(dataUrl, 5)
        setExtractedColors(colors)
        if (colors.length > 0) {
          setSelectedColor(colors[0])
          setHarmony(generateOutfitMakeupHarmony(colors[0], occasion, style))
        }
      } catch (err) {
        console.error('Failed to extract colors:', err)
      } finally {
        setIsExtracting(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSelectColor = (color: ExtractedColor) => {
    setSelectedColor(color)
    setHarmony(generateOutfitMakeupHarmony(color, occasion, style))
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
          FEATURE 3: OUTFIT-AWARE COLOR HARMONY
        </span>
        <h3 style={{ margin: '4px 0 6px', fontSize: '26px', fontFamily: 'var(--serif)' }}>
          Upload Your Attire or Select Outfit Shades
        </h3>
        <p style={{ margin: 0, color: 'var(--muted)', font: '14px var(--serif)' }}>
          Whether wearing a maroon bridal lehenga, emerald silk saree, or ivory gown, Lemon harmonizes your makeup palette.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '24px' }}>
        {/* Left: Upload Box or Image Preview */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          {outfitPreviewUrl ? (
            <div
              style={{
                position: 'relative',
                border: '1.5px solid var(--ink)',
                background: 'var(--cream)',
                overflow: 'hidden',
                boxShadow: '6px 6px 0 var(--yellow)',
              }}
            >
              <img
                src={outfitPreviewUrl}
                alt="Uploaded outfit"
                style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }}
              />
              <button
                type="button"
                onClick={() => {
                  setOutfitPreviewUrl(null)
                  setExtractedColors(FALLBACK_PALETTE)
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '6px 10px',
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={14} /> Remove
              </button>
              <div style={{ padding: '10px 14px', background: 'var(--cream)', borderTop: '1px solid var(--line)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700 }}>
                  {isExtracting ? 'Extracting dominant palette...' : 'Dominant shades detected from your attire:'}
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="upload-area"
              style={{ minHeight: '220px', cursor: 'pointer' }}
              aria-label="Upload outfit photo"
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--yellow)',
                  border: '1.5px solid var(--ink)',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <Palette size={20} />
              </div>
              <h4 style={{ margin: '4px 0 2px' }}>Upload Outfit Photo</h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                Saree, Lehenga, Gown, or Dress
              </p>
              <span className="upload-button" style={{ marginTop: '12px' }}>
                <Upload size={14} /> Choose Image
              </span>
              <small style={{ marginTop: '6px' }}>JPG, PNG or WebP · Max 10 MB</small>
            </button>
          )}

          {/* Extracted Colors Swatches */}
          <div style={{ marginTop: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              Extracted Attire Palette (Select Primary):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {extractedColors.map((color) => {
                const isSelected = selectedColor?.hex === color.hex
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => handleSelectColor(color)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      border: isSelected ? '2px solid var(--ink)' : '1px solid var(--line)',
                      background: isSelected ? 'var(--yellow)' : 'var(--cream)',
                      boxShadow: isSelected ? '3px 3px 0 var(--ink)' : 'none',
                      cursor: 'pointer',
                      borderRadius: '2px',
                    }}
                  >
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: color.hex,
                        border: '1px solid rgba(0,0,0,0.2)',
                      }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{color.name}</span>
                    {isSelected && <Check size={12} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Manual swatches fallback */}
          <div style={{ marginTop: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                marginBottom: '8px',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              Or Pick from Traditional & Modern Swatches:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {MANUAL_SWATCHES.map((swatch) => {
                const isSelected = selectedColor?.hex === swatch.hex
                return (
                  <button
                    key={swatch.name}
                    type="button"
                    onClick={() =>
                      handleSelectColor({
                        hex: swatch.hex,
                        rgb: [120, 30, 40],
                        name: swatch.name,
                      })
                    }
                    title={swatch.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: swatch.hex,
                      border: isSelected ? '2.5px solid var(--ink)' : '1px solid rgba(0,0,0,0.2)',
                      boxShadow: isSelected ? '0 0 0 2px var(--yellow)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Color Harmony Explanation and Tailored Recommendations */}
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
                COMPUTED COLOR HARMONY
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: '22px', fontFamily: 'var(--serif)' }}>
                {harmony.outfitColorName} · {harmony.colorHarmonyType}
              </h3>
            </div>
            <span
              style={{
                padding: '4px 10px',
                background: 'var(--yellow)',
                border: '1px solid var(--ink)',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              Harmonized
            </span>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Reasoning */}
            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Why This Combination Works:
              </strong>
              <p
                style={{
                  margin: '4px 0 0',
                  font: '14px/1.45 var(--serif)',
                  color: 'var(--ink)',
                }}
              >
                {harmony.reasoning}
              </p>
            </div>

            {/* Eyeshadow Palette */}
            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Recommended Eyeshadow Palette:
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                {harmony.eyeshadowPalette.map((hex, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      background: hex,
                      border: '1px solid var(--ink)',
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
              <p style={{ margin: 0, font: '13px var(--serif)', color: 'var(--muted)' }}>
                {harmony.eyeshadowDescription}
              </p>
            </div>

            {/* Blush Tones */}
            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Complementary Blush Tones:
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                {harmony.blushTones.map((hex, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: hex,
                      border: '1px solid var(--ink)',
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
              <p style={{ margin: 0, font: '13px var(--serif)', color: 'var(--muted)' }}>
                {harmony.blushDescription}
              </p>
            </div>

            {/* Lipstick Shades */}
            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Suggested Lip Shades:
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                {harmony.lipstickShades.map((hex, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      background: hex,
                      border: '1px solid var(--ink)',
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
              <p style={{ margin: 0, font: '13px var(--serif)', color: 'var(--muted)' }}>
                {harmony.lipstickDescription}
              </p>
            </div>

            {/* Highlighter */}
            <div
              style={{
                background: 'rgba(244, 216, 74, 0.25)',
                padding: '10px 14px',
                border: '1px solid var(--ink)',
              }}
            >
              <strong style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> Highlighter Match:
              </strong>
              <p style={{ margin: '3px 0 0', font: '12px var(--serif)' }}>
                {harmony.highlighterRecommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
