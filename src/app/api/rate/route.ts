import { NextRequest, NextResponse } from 'next/server'
import { getUsdInrRate } from '@/lib/exchangeRate'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') ?? undefined
    const rate = await getUsdInrRate(date)
    return NextResponse.json({ rate })
  } catch (error) {
    console.error('GET /api/rate failed:', error)
    return NextResponse.json({ error: 'Failed to fetch rate', details: String(error) }, { status: 500 })
  }
}
