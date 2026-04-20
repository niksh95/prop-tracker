import { NextRequest, NextResponse } from 'next/server'
import { getUsdInrRate } from '@/lib/exchangeRate'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') ?? undefined
    const rate = await getUsdInrRate(date)
    return NextResponse.json({ rate })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rate' }, { status: 500 })
  }
}
