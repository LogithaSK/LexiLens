import { NextRequest, NextResponse } from 'next/server'

interface ApplyRequestBody {
  imageBase64: string
  lipstickColorHex?: string
  lipstickFinish?: 'matte' | 'satin' | 'gloss' | 'shimmer'
  blushColorHex?: string
  blushIntensity?: number
  eyeshadowColorHex?: string
  foundationTone?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ApplyRequestBody = await req.json()

    if (!body || !body.imageBase64) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing facial image. Please provide a valid base64-encoded image string.',
        },
        { status: 400 }
      )
    }

    // Validate image format and payload size (max 10MB)
    const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const approxSizeBytes = (base64Data.length * 3) / 4

    if (approxSizeBytes > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image file size exceeds the 10 MB limit. Please compress or select a smaller image.',
        },
        { status: 413 }
      )
    }

    const apiKey = process.env.UCAM_API_KEY || process.env.PERFECTCORP_API_KEY
    const apiUrl = process.env.UCAM_API_URL || 'https://yce-api.perfectcorp.com/v1/makeup/apply'

    // If UCam API credentials are not configured in environment
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          apiUsed: 'ucam_cloud',
          error:
            'UCam API credentials (UCAM_API_KEY) are not configured in the backend environment. Please configure your Perfect Corp UCam Cloud API key in .env.local to enable live cloud processing.',
          requiresCredentials: true,
          configured: false,
        },
        { status: 503 }
      )
    }

    // Call upstream Perfect Corp UCam Cloud API
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
      const ucamResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'X-Client-Version': 'Lemon-AI/1.0',
        },
        body: JSON.stringify({
          image: base64Data,
          effects: {
            lip_color: body.lipstickColorHex || '#C94B5A',
            lip_texture: body.lipstickFinish || 'satin',
            blush_color: body.blushColorHex || '#E68A7E',
            blush_intensity: body.blushIntensity ?? 70,
            eyeshadow_color: body.eyeshadowColorHex || '#B8860B',
            foundation_tone: body.foundationTone || 'natural',
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (ucamResponse.status === 429) {
        const retryAfter = ucamResponse.headers.get('Retry-After') || '60'
        return NextResponse.json(
          {
            success: false,
            apiUsed: 'ucam_cloud',
            error: `UCam API rate limit reached. Please wait ${retryAfter} seconds before retrying.`,
            retryAfterSeconds: parseInt(retryAfter, 10),
          },
          { status: 429 }
        )
      }

      if (!ucamResponse.ok) {
        const errorText = await ucamResponse.text()
        return NextResponse.json(
          {
            success: false,
            apiUsed: 'ucam_cloud',
            error: `UCam API returned error status ${ucamResponse.status}: ${errorText || ucamResponse.statusText}`,
          },
          { status: ucamResponse.status }
        )
      }

      const result = await ucamResponse.json()
      return NextResponse.json({
        success: true,
        apiUsed: 'ucam_cloud',
        processedImageBase64: result.processed_image || result.image_url,
        message: 'Virtual makeup applied successfully via Perfect Corp UCam Cloud API.',
      })
    } catch (networkErr: any) {
      clearTimeout(timeout)
      if (networkErr.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            apiUsed: 'ucam_cloud',
            error: 'Connection to UCam API timed out after 15 seconds. Please check network connection and retry.',
          },
          { status: 504 }
        )
      }
      return NextResponse.json(
        {
          success: false,
          apiUsed: 'ucam_cloud',
          error: `Network error connecting to UCam API: ${networkErr.message || 'Connection refused'}`,
        },
        { status: 502 }
      )
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid request payload or server error: ${err.message}`,
      },
      { status: 500 }
    )
  }
}
