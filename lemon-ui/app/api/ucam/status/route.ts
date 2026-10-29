import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.UCAM_API_KEY || process.env.PERFECTCORP_API_KEY
  const apiUrl = process.env.UCAM_API_URL || 'https://yce-api.perfectcorp.com/v1/makeup'

  return NextResponse.json({
    service: 'Perfect Corp UCam Virtual Try-On API Gateway',
    configured: Boolean(apiKey),
    endpoint: apiUrl,
    supportedEffects: [
      'lip_color',
      'lip_finish (matte, satin, gloss, shimmer)',
      'blush',
      'eye_shadow',
      'foundation_tone',
    ],
    missingRequirements: apiKey
      ? []
      : [
          'UCAM_API_KEY or PERFECTCORP_API_KEY in environment (.env.local)',
          'UCAM_API_URL (defaults to https://yce-api.perfectcorp.com/v1/makeup)',
        ],
    serverTime: new Date().toISOString(),
  })
}
