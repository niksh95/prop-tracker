import { NextRequest, NextResponse } from 'next/server'

function calculateIndianTax(income: number) {
  // Old regime slabs (in INR)
  let tax = 0
  if (income <= 250000) {
    tax = 0
  } else if (income <= 500000) {
    tax = (income - 250000) * 0.05
  } else if (income <= 1000000) {
    tax = 250000 * 0.05 + (income - 500000) * 0.20
  } else {
    tax = 250000 * 0.05 + 500000 * 0.20 + (income - 1000000) * 0.30
  }
  // Add 4% cess
  tax += tax * 0.04
  return tax
}

export async function POST(request: NextRequest) {
  try {
    const { netProfit } = await request.json()
    const tax = calculateIndianTax(netProfit)
    const quarterlyTax = tax / 4 // Approximate quarterly advance tax
    return NextResponse.json({ tax, quarterlyTax })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate tax' }, { status: 500 })
  }
}