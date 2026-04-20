import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUsdInrRate } from '@/lib/exchangeRate'

export const runtime = 'nodejs'

const BANKING_COST_PERCENT = 1.5 // 1.5%

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('GET /api/transactions failed:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, propFirmType = 'futures', amountUSD, amountINRDirect, date, propFirm, notes, bankingCostPercent = BANKING_COST_PERCENT, count = 1 } = await request.json()
    const numberOfTransactions = Number(count) > 1 ? Math.floor(Number(count)) : 1

    let amountINR: number
    let bankingCost: number

    if (amountINRDirect && Number(amountINRDirect) > 0) {
      // User provided exact INR — skip all USD/rate calculations
      amountINR = Number(amountINRDirect)
      bankingCost = 0
    } else {
      // Calculate INR from USD using exchange rate
      // For payments (challenge fees): banking cost is added (you pay more)
      // For payouts: banking cost is subtracted (you receive less)
      const rate = await getUsdInrRate(date)
      const converted = amountUSD * rate
      bankingCost = converted * (bankingCostPercent / 100)
      amountINR = type === 'payout' ? converted - bankingCost : converted + bankingCost
    }

    const transactionData = {
      type,
      propFirmType,
      amountUSD,
      amountINR,
      date: new Date(date),
      propFirm,
      notes,
      bankingCost
    }

    if (numberOfTransactions > 1) {
      const result = await prisma.transaction.createMany({
        data: Array(numberOfTransactions).fill(transactionData)
      })
      return NextResponse.json({ count: result.count }, { status: 201 })
    }

    const transaction = await prisma.transaction.create({
      data: transactionData
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('POST /api/transactions failed:', error)
    return NextResponse.json({ error: 'Failed to create transaction', details: String(error) }, { status: 500 })
  }
}