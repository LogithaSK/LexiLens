'use client'

import React, { useState } from 'react'
import { FACE_REGIONS } from '../../lib/data/face-map-data'
import { FaceRegionData } from '../../lib/types/makeup'
import { Check, Sparkles, X } from 'lucide-react'

interface InteractiveFaceMapProps {
  onSelectRegion?: (region: FaceRegionData) => void
  selectedRegionId?: string
}

export function InteractiveFaceMap({
  onSelectRegion,
  selectedRegionId: externalSelectedId,
}: InteractiveFaceMapProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string>('cheeks')
  const [showOverlay, setShowOverlay] = useState(true)

  const activeId = externalSelectedId || internalSelectedId
  const activeRegion = FACE_REGIONS.find((r) => r.id === activeId) || FACE_REGIONS[3]

  const handleSelect = (region: FaceRegionData) => {
    setInternalSelectedId(region.id)
    if (onSelectRegion) onSelectRegion(region)
  }

  return (
    <div className="face-map-container" style={{ marginTop: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--line)',
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
            FEATURE 5: FACIAL MAKEUP PLACEMENT MAP
          </span>
          <h4 style={{ margin: '4px 0 0', fontFamily: 'var(--serif)', fontSize: '20px' }}>
            Interactive Zone-by-Zone Application Guide
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setShowOverlay(!showOverlay)}
          style={{
            padding: '6px 12px',
            border: '1px solid var(--ink)',
            background: showOverlay ? 'var(--ink)' : 'transparent',
            color: showOverlay ? 'var(--cream)' : 'var(--ink)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {showOverlay ? 'Hide Overlays' : 'Show Overlays'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 310px) 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* SVG Face Diagram */}
        <div
          style={{
            position: 'relative',
            background: 'var(--cream)',
            border: '1.5px solid var(--ink)',
            boxShadow: '6px 6px 0 var(--yellow)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <svg
            viewBox="0 0 300 340"
            style={{ width: '100%', height: 'auto', maxHeight: '320px' }}
            aria-label="Interactive Face Map Diagram"
          >
            {/* Base Face Contour */}
            <ellipse
              cx="150"
              cy="165"
              rx="92"
              ry="125"
              fill="rgba(244, 216, 74, 0.12)"
              stroke="var(--ink)"
              strokeWidth="2"
            />

            {/* Hairline subtle arc */}
            <path
              d="M 68 110 Q 150 45 232 110"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Neck contours */}
            <path
              d="M 110 270 L 105 320 M 190 270 L 195 320"
              stroke="var(--ink)"
              strokeWidth="1.5"
            />

            {/* Eyebrows */}
            <path
              d="M 100 112 Q 120 102 135 110 M 165 110 Q 180 102 200 112"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Eyes */}
            <ellipse cx="118" cy="125" rx="14" ry="7" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
            <circle cx="118" cy="125" r="3.5" fill="var(--ink)" />
            <ellipse cx="182" cy="125" rx="14" ry="7" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
            <circle cx="182" cy="125" r="3.5" fill="var(--ink)" />

            {/* Nose line */}
            <path
              d="M 150 135 L 146 182 Q 150 188 156 182"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Lips */}
            <path
              d="M 130 236 Q 142 230 150 233 Q 158 230 170 236 Q 150 248 130 236 Z"
              fill={activeId === 'lips' ? 'var(--yellow)' : 'rgba(28,27,22,0.1)'}
              stroke="var(--ink)"
              strokeWidth="1.5"
            />

            {/* Interactive Region Target Hotspots */}
            {showOverlay &&
              FACE_REGIONS.map((region) => {
                const isSelected = region.id === activeId
                return (
                  <g
                    key={region.id}
                    onClick={() => handleSelect(region)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={region.cx}
                      cy={region.cy}
                      r={region.r}
                      fill={
                        isSelected
                          ? 'rgba(244, 216, 74, 0.72)'
                          : 'rgba(28, 27, 22, 0.08)'
                      }
                      stroke={isSelected ? 'var(--ink)' : 'rgba(28,27,22,0.3)'}
                      strokeWidth={isSelected ? '2' : '1'}
                      strokeDasharray={isSelected ? 'none' : '4 3'}
                      style={{ transition: 'all 0.2s' }}
                    />
                    <circle
                      cx={region.cx}
                      cy={region.cy}
                      r="4"
                      fill={isSelected ? 'var(--ink)' : 'var(--muted)'}
                    />
                    <text
                      x={region.cx}
                      y={region.cy + 3}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="bold"
                      fill={isSelected ? 'var(--ink)' : 'var(--muted)'}
                      pointerEvents="none"
                    >
                      {region.name.split(' ')[0]}
                    </text>
                  </g>
                )
              })}
          </svg>

          <span style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '8px' }}>
            ✦ Tap any region on the face to view custom placement
          </span>
        </div>

        {/* Region Detail Card */}
        <div
          style={{
            border: '1.5px solid var(--ink)',
            background: 'var(--cream)',
            padding: '24px',
            boxShadow: '6px 6px 0 var(--line)',
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
                SELECTED FACIAL ZONE
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: '24px', fontFamily: 'var(--serif)' }}>
                {activeRegion.name}
              </h3>
            </div>
            <span
              style={{
                width: '32px',
                height: '32px',
                border: '1px solid var(--ink)',
                borderRadius: '50%',
                background: 'var(--yellow)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Sparkles size={16} />
            </span>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Application Technique:
              </strong>
              <p
                style={{
                  margin: '4px 0 0',
                  font: '14px/1.45 var(--serif)',
                  color: 'var(--ink)',
                }}
              >
                {activeRegion.recommendedTechnique}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Sculpting & Color Placement:
              </strong>
              <p
                style={{
                  margin: '4px 0 0',
                  font: '13px/1.4 var(--serif)',
                  color: 'var(--muted)',
                }}
              >
                {activeRegion.blushContourNote}
              </p>
            </div>

            <div
              style={{
                background: 'rgba(244, 216, 74, 0.25)',
                padding: '10px 14px',
                border: '1px solid var(--ink)',
              }}
            >
              <strong style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> Blending Secret:
              </strong>
              <p style={{ margin: '3px 0 0', font: '12px var(--serif)' }}>
                {activeRegion.blendingTip}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Recommended Key Products:
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {activeRegion.productsUsed.map((prod) => (
                  <span
                    key={prod}
                    style={{
                      fontSize: '11px',
                      padding: '4px 9px',
                      border: '1px solid var(--ink)',
                      background: 'var(--paper)',
                      borderRadius: '2px',
                    }}
                  >
                    {prod}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
