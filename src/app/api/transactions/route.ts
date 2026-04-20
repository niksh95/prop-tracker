import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUsdInrRate } from '@/lib/exchangeRate'

const BANKING_COST_PERCENT = 1.5 // 1.5%

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, propFirmType = 'futures', amountUSD, date, propFirm, notes, bankingCostPercent = BANKING_COST_PERCENT, count = 1 } = await request.json()
    const numberOfTransactions = Number(count) > 1 ? Math.floor(Number(count)) : 1

    // Fetch USD-INR rate for the transaction date
    const rate = await getUsdInrRate(date)

    // Calculate INR
    const converted = amountUSD * rate
    const bankingCost = converted * (bankingCostPercent / 100)
    const amountINR = converted + bankingCost

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
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}