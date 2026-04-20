'use client'

import { useEffect, useState } from 'react'

interface Transaction {
  id: number
  type: string
  amountUSD: number
  amountINR: number
  date: string
  propFirm: string
  notes?: string
  bankingCost: number
}

interface PropFirmSummary {
  name: string
  totalPayouts: number
  totalPayments: number
  netPL: number
  transactions: Transaction[]
}

export default function PropFirmPL() {
  const [propFirms, setPropFirms] = useState<PropFirmSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      
      // Ensure data is an array
      const txnsArray = Array.isArray(data) ? data : []

      // Group by prop firm
      const grouped = txnsArray.reduce((acc: { [key: string]: Transaction[] }, t: Transaction) => {
        if (!acc[t.propFirm]) acc[t.propFirm] = []
        acc[t.propFirm].push(t)
        return acc
      }, {})

      // Calculate P/L for each
      const summaries = Object.entries(grouped).map(([name, txns]) => {
        const transactionsArray = txns as Transaction[]
        const payments = transactionsArray.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amountINR, 0)
        const payouts = transactionsArray.filter(t => t.type === 'payout').reduce((sum, t) => sum + t.amountINR, 0)
        return {
          name,
          totalPayouts: payouts,
          totalPayments: payments,
          netPL: payouts - payments,
          transactions: transactionsArray
        }
      })

      setPropFirms(summaries.sort((a, b) => b.netPL - a.netPL))
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    </div>
  )

  const totalNetPL = propFirms.reduce((sum, pf) => sum + pf.netPL, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Prop Firm P/L Analysis</h1>
          <p className="text-gray-600">Performance breakdown by trading firm</p>
        </div>

        {/* Overall Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-blue-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Firms</p>
              <p className="text-3xl font-bold text-gray-900">{propFirms.length}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total P/L</p>
              <p className={`text-3xl font-bold ${totalNetPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{totalNetPL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Best Performer</p>
              <p className="text-3xl font-bold text-green-600">
                {propFirms.length > 0 ? propFirms[0].name : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Firms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {propFirms.map((firm) => (
            <div key={firm.name} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6 border-b-2 border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{firm.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{firm.transactions.length} transactions</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                    firm.netPL >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {firm.netPL >= 0 ? '+' : ''}₹{firm.netPL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* P/L Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold">PAYOUTS</p>
                    <p className="text-2xl font-bold text-green-600">₹{firm.totalPayouts.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold">PAYMENTS</p>
                    <p className="text-2xl font-bold text-red-600">₹{firm.totalPayments.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Recent Activity</p>
                  <div className="space-y-2">
                    {firm.transactions.slice(0, 3).map((t) => (
                      <div key={t.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="text-gray-900 font-medium">{t.type}</p>
                          <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('en-IN')}</p>
                        </div>
                        <p className={`font-semibold ${t.type === 'payout' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'payout' ? '+' : '-'}₹{t.amountINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    ))}
                    {firm.transactions.length > 3 && (
                      <p className="text-xs text-blue-600 font-semibold">+{firm.transactions.length - 3} more</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {propFirms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No transactions yet. Add one to see P/L analysis.</p>
          </div>
        )}
      </div>
    </div>
  )
}