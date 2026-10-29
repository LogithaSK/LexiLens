'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  applyUCamTryon,
  checkUCamApiStatus,
  ClientBeautyEffects,
  renderClientBeautyPreview,
} from '../../lib/services/ucam-service'
import { InteractiveFaceMap } from '../face-map/interactive-face-map'
import {
  AlertCircle,
  Camera,
  Check,
  ChevronDown,
  Layers,
  MapPin,
  RefreshCw,
  Sliders,
  Sparkles,
  Upload,
  WandSparkles,
  X,
} from 'lucide-react'

interface StepTryonProps {
  userImage: string | null
  setUserImage: (img: string | null) => void
  lipstickColor: string
  setLipstickColor: (hex: string) => void
  blushColor: string
  setBlushColor: (hex: string) => void
  eyeshadowColor: string
  setEyeshadowColor: (hex: string) => void
}

const DEFAULT_SAMPLE_PHOTO =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85'

const LIP_SHADES = [
  { name: 'Ruby Woo Red', hex: '#A81C28' },
  { name: 'Velvet Rosewood', hex: '#A65561' },
  { name: 'Toasted Terracotta', hex: '#BA5641' },
  { name: 'Warm Nude Peach', hex: '#CF7B65' },
  { name: 'Deep Plum Wine', hex: '#632135' },
]

const BLUSH_SHADES = [
  { name: 'Soft Coral Peach', hex: '#E68A7E' },
  { name: 'Warm Terracotta', hex: '#D27D66' },
  { name: 'Dusty Rose Pink', hex: '#D47E8A' },
  { name: 'Sweet Cinnamon', hex: '#C2745D' },
]

const EYE_SHADES = [
  { name: 'Champagne Gold', hex: '#D4AF37' },
  { name: 'Burnished Copper', hex: '#C67D5A' },
  { name: 'Espresso Bronze', hex: '#8C6239' },
  { name: 'Rose Mauve', hex: '#A86C7A' },
]

export function StepTryon({
  userImage,
  setUserImage,
  lipstickColor,
  setLipstickColor,
  blushColor,
  setBlushColor,
  eyeshadowColor,
  setEyeshadowColor,
}: StepTryonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // State
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [lipstickFinish, setLipstickFinish] = useState<'matte' | 'satin' | 'gloss' | 'shimmer'>('satin')
  const [blushIntensity, setBlushIntensity] = useState<number>(65)
  const [foundationTone, setFoundationTone] = useState<string>('warm')

  // Processed try-on preview
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [sliderPosition, setSliderPosition] = useState<number>(50)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCallingApi, setIsCallingApi] = useState(false)

  // API State
  const [apiStatus, setApiStatus] = useState<{
    configured: boolean
    service: string
    missingRequirements: string[]
  } | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiSuccessMessage, setApiSuccessMessage] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'client_vision' | 'ucam_cloud'>('client_vision')

  // Interactive Face Map Toggle (Feature 5)
  const [showFaceMap, setShowFaceMap] = useState(false)

  const activeBaseImage = userImage || DEFAULT_SAMPLE_PHOTO

  // Check UCam API status on mount
  useEffect(() => {
    checkUCamApiStatus().then(setApiStatus)
  }, [])

  // Auto-render beauty preview whenever controls or image change
  useEffect(() => {
    let isCancelled = false
    setIsProcessing(true)

    const effects: ClientBeautyEffects = {
      lipstickColorHex: lipstickColor,
      lipstickFinish,
      blushColorHex: blushColor,
      blushIntensity,
      eyeshadowColorHex: eyeshadowColor,
      foundationTone,
    }

    renderClientBeautyPreview(activeBaseImage, effects).then((rendered) => {
      if (!isCancelled) {
        setProcessedImage(rendered)
        setIsProcessing(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [activeBaseImage, lipstickColor, lipstickFinish, blushColor, blushIntensity, eyeshadowColor, foundationTone])

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  // File Upload with validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setApiError('Invalid file format. Please upload a JPG, PNG, or WebP facial image.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setApiError('File size exceeds 10 MB limit. Please select a smaller photo.')
      return
    }

    setApiError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUserImage(ev.target?.result as string)
      setPreviewMode('client_vision')
    }
    reader.readAsDataURL(file)
  }

  // Camera Capture
  const startCamera = async () => {
    try {
      setApiError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      })
      setCameraStream(stream)
      setIsCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: any) {
      setApiError(
        `Unable to access webcam: ${err.message || 'Permission denied or no camera device found.'}`
      )
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth || 640
    canvas.height = videoRef.current.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      setUserImage(dataUrl)
      stopCamera()
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setIsCameraActive(false)
  }

  // UCam Cloud API Trigger
  const handleCallUcamApi = async () => {
    setIsCallingApi(true)
    setApiError(null)
    setApiSuccessMessage(null)

    try {
      const response = await applyUCamTryon({
        imageBase64: activeBaseImage,
        lipstickColorHex: lipstickColor,
        lipstickFinish,
        blushColorHex: blushColor,
        blushIntensity,
        eyeshadowColorHex: eyeshadowColor,
        foundationTone,
      })

      if (response.success && response.processedImageBase64) {
        setProcessedImage(response.processedImageBase64)
        setPreviewMode('ucam_cloud')
        setApiSuccessMessage(
          response.message || 'Virtual makeup successfully generated via UCam Cloud API!'
        )
      } else {
        // Honest error display without faking success
        setApiError(
          response.error ||
            'UCam Cloud API returned an unexpected error. Client-side visual preview remains active.'
        )
      }
    } catch (err: any) {
      setApiError(`Network failure contacting UCam API gateway: ${err.message}`)
    } finally {
      setIsCallingApi(false)
    }
  }

  return (
    <div className="builder-step-content" style={{ display: 'grid', gap: '24px' }}>
      {/* Header */}
      <div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          FEATURE 1: UCAM API INTEGRATION & VIRTUAL MAKEUP PREVIEW
        </span>
        <h3 style={{ margin: '4px 0 6px', fontSize: '26px', fontFamily: 'var(--serif)' }}>
          See Your Look: Virtual Try-On & Face Mapping
        </h3>
        <p style={{ margin: 0, color: 'var(--muted)', font: '14px var(--serif)' }}>
          Upload your portrait or use your camera to preview lipstick shades, finishes, blush, and eyeshadow before recreating the look.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Camera Modal / Live View */}
      {isCameraActive && (
        <div
          style={{
            border: '2px solid var(--ink)',
            background: 'var(--cream)',
            padding: '16px',
            boxShadow: '6px 6px 0 var(--ink)',
            position: 'relative',
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
            <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={16} /> Live Camera Capture
            </strong>
            <button
              type="button"
              onClick={stopCamera}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--ink)',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              maxHeight: '360px',
              objectFit: 'cover',
              background: '#000',
              border: '1px solid var(--ink)',
            }}
          />

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={capturePhoto}
              style={{
                padding: '10px 20px',
                background: 'var(--ink)',
                color: 'var(--cream)',
                border: '1.5px solid var(--ink)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Camera size={16} /> Snap Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                color: 'var(--ink)',
                border: '1px solid var(--ink)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* API Notice / Error Banner */}
      {apiError && (
        <div
          style={{
            background: '#FFF0F0',
            border: '1.5px solid #D32F2F',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            color: '#900',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '12px' }}>UCam API Gateway Notice:</strong>
            <p style={{ margin: '2px 0 6px', fontSize: '12px', lineHeight: 1.4 }}>{apiError}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCallUcamApi}
                style={{
                  padding: '4px 10px',
                  background: '#900',
                  color: '#fff',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={12} /> Retry API Request
              </button>
              <button
                type="button"
                onClick={() => setApiError(null)}
                style={{
                  padding: '4px 10px',
                  background: 'transparent',
                  color: '#900',
                  border: '1px solid #900',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Success Notification */}
      {apiSuccessMessage && (
        <div
          style={{
            background: '#F0FFF4',
            border: '1.5px solid #2E7D32',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#1B5E20',
            fontSize: '12px',
          }}
        >
          <Check size={16} />
          <span>{apiSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Preview Split Slider on Left, Effect Controls on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1fr) minmax(280px, 340px)',
          gap: '24px',
        }}
      >
        {/* Left: Interactive Before/After Split Comparison Slider */}
        <div>
          <div
            style={{
              position: 'relative',
              border: '1.5px solid var(--ink)',
              background: 'var(--cream)',
              height: '420px',
              overflow: 'hidden',
              boxShadow: '8px 8px 0 var(--yellow)',
              userSelect: 'none',
            }}
          >
            {/* Background Image: Processed Look (After) */}
            <img
              src={processedImage || activeBaseImage}
              alt="Processed makeup try-on"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />

            {/* Foreground Clipped Image: Original Portrait (Before) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                width: `${sliderPosition}%`,
                overflow: 'hidden',
                borderRight: '2px solid var(--ink)',
                background: 'var(--cream)',
              }}
            >
              <img
                src={activeBaseImage}
                alt="Original face portrait"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  minWidth: '400px',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  padding: '4px 8px',
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  fontSize: '9px',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                }}
              >
                ORIGINAL (BEFORE)
              </span>
            </div>

            {/* Label for After */}
            <span
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '4px 8px',
                background: 'var(--yellow)',
                border: '1px solid var(--ink)',
                color: 'var(--ink)',
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '0.1em',
              }}
            >
              VIRTUAL LOOK (AFTER)
            </span>

            {/* Draggable Split Handle */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sliderPosition}%`,
                width: '28px',
                transform: 'translateX(-50%)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'ew-resize',
                zIndex: 4,
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--yellow)',
                  border: '1.5px solid var(--ink)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '11px',
                  fontWeight: 900,
                }}
              >
                ⟷
              </div>
            </div>

            {/* HTML Slider Range for smooth dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              aria-label="Before and After split comparison slider"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'ew-resize',
                zIndex: 5,
                margin: 0,
              }}
            />
          </div>

          {/* Photo Actions bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              marginTop: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '7px 12px',
                  background: 'var(--cream)',
                  border: '1px solid var(--ink)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Upload size={14} /> Upload Portrait
              </button>
              <button
                type="button"
                onClick={startCamera}
                style={{
                  padding: '7px 12px',
                  background: 'var(--cream)',
                  border: '1px solid var(--ink)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Camera size={14} /> Use Camera
              </button>
            </div>

            {/* UCam API Trigger Button */}
            <button
              type="button"
              onClick={handleCallUcamApi}
              disabled={isCallingApi}
              style={{
                padding: '7px 14px',
                background: 'var(--ink)',
                color: 'var(--cream)',
                border: '1px solid var(--ink)',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isCallingApi ? 'wait' : 'pointer',
              }}
            >
              {isCallingApi ? (
                <>
                  <RefreshCw size={13} className="spin" /> Processing UCam Cloud...
                </>
              ) : (
                <>
                  <WandSparkles size={13} /> Run UCam API Try-On
                </>
              )}
            </button>
          </div>

          {/* Toggle Interactive Face Map Button */}
          <div style={{ marginTop: '14px' }}>
            <button
              type="button"
              onClick={() => setShowFaceMap(!showFaceMap)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid var(--ink)',
                background: showFaceMap ? 'var(--yellow)' : 'var(--cream)',
                boxShadow: showFaceMap ? '3px 3px 0 var(--ink)' : 'none',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <MapPin size={15} />
              {showFaceMap
                ? 'Close Interactive Placement Map'
                : 'Open Feature 5: Interactive Facial Placement Map'}
            </button>
          </div>
        </div>

        {/* Right: Live Cosmetic Effect Experimentation Controls */}
        <div
          style={{
            border: '1.5px solid var(--ink)',
            background: 'var(--cream)',
            padding: '20px',
            boxShadow: '6px 6px 0 var(--yellow)',
            display: 'grid',
            gap: '18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '10px',
            }}
          >
            <strong style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Experiment With Effects
            </strong>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                background: previewMode === 'ucam_cloud' ? '#E8F5E9' : 'var(--yellow)',
                border: '1px solid var(--ink)',
                fontWeight: 700,
              }}
            >
              {previewMode === 'ucam_cloud' ? 'UCam Cloud' : 'Live AR Engine'}
            </span>
          </div>

          {/* 1. Lipstick Shade & Finish */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                marginBottom: '6px',
              }}
            >
              Lipstick Shade & Texture
            </label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              {LIP_SHADES.map((s) => (
                <button
                  key={s.hex}
                  type="button"
                  onClick={() => setLipstickColor(s.hex)}
                  title={s.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: s.hex,
                    border: lipstickColor === s.hex ? '2.5px solid var(--ink)' : '1px solid rgba(0,0,0,0.2)',
                    boxShadow: lipstickColor === s.hex ? '0 0 0 2px var(--yellow)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>

            {/* Finish selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              {(['matte', 'satin', 'gloss', 'shimmer'] as const).map((finish) => (
                <button
                  key={finish}
                  type="button"
                  onClick={() => setLipstickFinish(finish)}
                  style={{
                    padding: '5px 0',
                    border: lipstickFinish === finish ? '1px solid var(--ink)' : '1px solid var(--line)',
                    background: lipstickFinish === finish ? 'var(--ink)' : 'transparent',
                    color: lipstickFinish === finish ? 'var(--cream)' : 'var(--ink)',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {finish}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Blush Shade & Intensity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>Blush Tone & Warmth</label>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{blushIntensity}%</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              {BLUSH_SHADES.map((b) => (
                <button
                  key={b.hex}
                  type="button"
                  onClick={() => setBlushColor(b.hex)}
                  title={b.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: b.hex,
                    border: blushColor === b.hex ? '2.5px solid var(--ink)' : '1px solid rgba(0,0,0,0.2)',
                    boxShadow: blushColor === b.hex ? '0 0 0 2px var(--yellow)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={blushIntensity}
              onChange={(e) => setBlushIntensity(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ink)' }}
            />
          </div>

          {/* 3. Eyeshadow Shimmer */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
              Eyeshadow Tone
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {EYE_SHADES.map((e) => (
                <button
                  key={e.hex}
                  type="button"
                  onClick={() => setEyeshadowColor(e.hex)}
                  title={e.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    background: e.hex,
                    border: eyeshadowColor === e.hex ? '2.5px solid var(--ink)' : '1px solid rgba(0,0,0,0.2)',
                    boxShadow: eyeshadowColor === e.hex ? '0 0 0 2px var(--yellow)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {/* 4. Complexion Filter Tone */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
              Complexion Warmth
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setFoundationTone('warm')}
                style={{
                  padding: '6px 0',
                  border: foundationTone === 'warm' ? '1px solid var(--ink)' : '1px solid var(--line)',
                  background: foundationTone === 'warm' ? 'var(--yellow)' : 'transparent',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Golden Warm
              </button>
              <button
                type="button"
                onClick={() => setFoundationTone('neutral')}
                style={{
                  padding: '6px 0',
                  border: foundationTone === 'neutral' ? '1px solid var(--ink)' : '1px solid var(--line)',
                  background: foundationTone === 'neutral' ? 'var(--yellow)' : 'transparent',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Neutral Ivory
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 5: Interactive Facial Makeup Map (Mounted when toggled) */}
      {showFaceMap && <InteractiveFaceMap />}
    </div>
  )
}
