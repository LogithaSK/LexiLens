'use client'

import React from 'react'
import { Check, CircleHelp, ShieldCheck, Sparkles, X } from 'lucide-react'

interface LemonHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LemonHelpModal({ isOpen, onClose }: LemonHelpModalProps) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 200,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--cream)',
          border: '2px solid var(--ink)',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 10px 0 var(--ink)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'var(--yellow)',
            borderBottom: '2px solid var(--ink)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              LEMON BEAUTY GUIDE & ARCHITECTURE
            </span>
            <h2 style={{ margin: '2px 0 0', fontSize: '24px', fontFamily: 'var(--serif)' }}>
              How Lemon Works
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '32px',
              height: '32px',
              border: '1.5px solid var(--ink)',
              background: 'var(--cream)',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'grid', gap: '18px' }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontFamily: 'var(--serif)' }}>
              The 3 Connected Experiences
            </h3>
            <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
              <div style={{ padding: '10px 14px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
                <strong>1. SEE IT (Virtual Preview):</strong> Try on lipstick shades, blush, eyeshadow, and complexion warmth on your face with an interactive before/after split slider, powered by Perfect Corp UCam API and client-side AR.
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
                <strong>2. LEARN IT (Step-by-Step Masterclass):</strong> Clear, non-intimidating instructions adapted to your experience level (Beginner, Intermediate, or Advanced) covering skin prep to setting spray.
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
                <strong>3. GET IT (Smart Budget & Shopping List):</strong> Real Indian and global makeup products with honest pricing in INR. Filter by your budget, deduct products you already own, and swap alternatives.
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#FFFBEA',
              border: '1px solid #E6D080',
              padding: '14px 16px',
            }}
          >
            <strong style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Privacy & Safety Disclaimer
            </strong>
            <p style={{ margin: '6px 0 0', font: '13px var(--serif)', color: '#444' }}>
              Your face and outfit photos are processed locally in your browser. Photos are never stored on public servers or used to train AI models. Colour-correction advice is strictly cosmetic and educational.
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '14px' }}>UCam API Cloud Configuration</h4>
            <p style={{ margin: 0, font: '13px var(--serif)', color: 'var(--muted)' }}>
              To connect live Perfect Corp enterprise UCam Cloud processing, provide <code>UCAM_API_KEY</code> and <code>UCAM_API_URL</code> in your backend <code>.env.local</code>. When credentials are not provided, Lemon seamlessly utilizes its high-precision client-side AR visual engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
