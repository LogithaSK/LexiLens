import { UCamTryonRequest, UCamTryonResponse } from '../types/makeup'
import { hexToRgb } from './color-extractor'

export interface ClientBeautyEffects {
  lipstickColorHex: string
  lipstickFinish: 'matte' | 'satin' | 'gloss' | 'shimmer'
  blushColorHex: string
  blushIntensity: number
  eyeshadowColorHex: string
  foundationTone: string
}

export async function checkUCamApiStatus(): Promise<{
  configured: boolean
  service: string
  missingRequirements: string[]
}> {
  try {
    const res = await fetch('/api/ucam/status')
    if (!res.ok) {
      return {
        configured: false,
        service: 'UCam Virtual Try-On API',
        missingRequirements: ['Could not reach backend API endpoint'],
      }
    }
    return await res.json()
  } catch {
    return {
      configured: false,
      service: 'UCam Virtual Try-On API',
      missingRequirements: ['Network unreachable'],
    }
  }
}

export async function applyUCamTryon(request: UCamTryonRequest): Promise<UCamTryonResponse> {
  const response = await fetch('/api/ucam/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  const data = await response.json()
  return data
}

/**
 * Interactive Client-Side Beauty Canvas Renderer:
 * Applies cosmetic tinting, soft-light blush diffusion, eyeshadow shimmer, and lip pigment blending
 * directly onto the user's face canvas.
 */
export async function renderClientBeautyPreview(
  imageSource: string,
  effects: ClientBeautyEffects
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(imageSource)
          return
        }

        canvas.width = img.naturalWidth || 800
        canvas.height = img.naturalHeight || 1000
        const w = canvas.width
        const h = canvas.height

        // 1. Draw base photo
        ctx.drawImage(img, 0, 0, w, h)

        // 2. Foundation / complexion filter (soft-light warming/evening)
        ctx.save()
        ctx.globalCompositeOperation = 'soft-light'
        ctx.fillStyle = effects.foundationTone === 'warm' ? 'rgba(235, 195, 150, 0.22)' : 'rgba(245, 225, 205, 0.18)'
        ctx.fillRect(w * 0.15, h * 0.1, w * 0.7, h * 0.75)
        ctx.restore()

        // 3. Cheeks / Blush
        ctx.save()
        const [br, bg, bb] = hexToRgb(effects.blushColorHex || '#E68A7E')
        const blushAlpha = Math.max(0.1, Math.min(0.5, (effects.blushIntensity || 50) / 160))
        ctx.globalCompositeOperation = 'color-burn'

        // Left cheek gradient
        const leftCheek = ctx.createRadialGradient(w * 0.35, h * 0.52, 10, w * 0.35, h * 0.52, w * 0.13)
        leftCheek.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, ${blushAlpha})`)
        leftCheek.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = leftCheek
        ctx.fillRect(w * 0.2, h * 0.4, w * 0.3, h * 0.25)

        // Right cheek gradient
        const rightCheek = ctx.createRadialGradient(w * 0.65, h * 0.52, 10, w * 0.65, h * 0.52, w * 0.13)
        rightCheek.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, ${blushAlpha})`)
        rightCheek.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = rightCheek
        ctx.fillRect(w * 0.5, h * 0.4, w * 0.3, h * 0.25)
        ctx.restore()

        // 4. Eyeshadow overlay
        ctx.save()
        const [er, eg, eb] = hexToRgb(effects.eyeshadowColorHex || '#B8860B')
        ctx.globalCompositeOperation = 'multiply'

        // Left eye
        const leftEyeGrad = ctx.createRadialGradient(w * 0.38, h * 0.39, 5, w * 0.38, h * 0.39, w * 0.08)
        leftEyeGrad.addColorStop(0, `rgba(${er}, ${eg}, ${eb}, 0.35)`)
        leftEyeGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = leftEyeGrad
        ctx.fillRect(w * 0.28, h * 0.32, w * 0.2, h * 0.14)

        // Right eye
        const rightEyeGrad = ctx.createRadialGradient(w * 0.62, h * 0.39, 5, w * 0.62, h * 0.39, w * 0.08)
        rightEyeGrad.addColorStop(0, `rgba(${er}, ${eg}, ${eb}, 0.35)`)
        rightEyeGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = rightEyeGrad
        ctx.fillRect(w * 0.52, h * 0.32, w * 0.2, h * 0.14)
        ctx.restore()

        // 5. Lipstick & Finish
        ctx.save()
        const [lr, lg, lb] = hexToRgb(effects.lipstickColorHex || '#C94B5A')
        ctx.globalCompositeOperation = 'multiply'

        const lipGrad = ctx.createRadialGradient(w * 0.5, h * 0.68, 5, w * 0.5, h * 0.68, w * 0.12)
        const lipOpacity = effects.lipstickFinish === 'matte' ? 0.65 : 0.52
        lipGrad.addColorStop(0, `rgba(${lr}, ${lg}, ${lb}, ${lipOpacity})`)
        lipGrad.addColorStop(0.7, `rgba(${lr}, ${lg}, ${lb}, ${lipOpacity * 0.8})`)
        lipGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = lipGrad
        ctx.fillRect(w * 0.36, h * 0.62, w * 0.28, h * 0.12)
        ctx.restore()

        // Shimmer / Gloss highlight
        if (effects.lipstickFinish === 'gloss' || effects.lipstickFinish === 'shimmer') {
          ctx.save()
          ctx.globalCompositeOperation = 'screen'
          const glossGrad = ctx.createRadialGradient(w * 0.5, h * 0.69, 2, w * 0.5, h * 0.69, w * 0.05)
          glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)')
          glossGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glossGrad
          ctx.fillRect(w * 0.44, h * 0.66, w * 0.12, h * 0.06)
          ctx.restore()
        }

        resolve(canvas.toDataURL('image/jpeg', 0.92))
      } catch (err) {
        console.warn('Beauty preview canvas error:', err)
        resolve(imageSource)
      }
    }
    img.onerror = () => resolve(imageSource)
    img.src = imageSource
  })
}
