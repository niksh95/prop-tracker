import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    const transaction = await prisma.transaction.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Transaction deleted', transaction })
  } catch (error) {
    console.error('DELETE /api/transactions/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to delete transaction', details: String(error) }, { status: 500 })
  }
}