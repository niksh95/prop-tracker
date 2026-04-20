'use client'

import { useEffect, useState } from 'react'

interface Transaction {
  id: number
  type: string
  propFirmType: string
  amountUSD: number
  amountINR: number
  date: string
  propFirm: string
  notes?: string
  bankingCost: number
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [totalPayouts, setTotalPayouts] = useState(0)
  const [totalPayments, setTotalPayments] = useState(0)
  const [taxEstimate, setTaxEstimate] = useState(0)
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
      setTransactions(txnsArray)

      // Calculate totals
      const payments = txnsArray.filter((t: Transaction) => t.type === 'payment').reduce((sum: number, t: Transaction) => sum + t.amountINR, 0)
      const payouts = txnsArray.filter((t: Transaction) => t.type === 'payout').reduce((sum: number, t: Transaction) => sum + t.amountINR, 0)
      const net = payouts - payments
      
      setTotalPayments(payments)
      setTotalPayouts(payouts)
      setBalance(net)

      // Calculate tax if net > 0
      if (net > 0) {
        const taxRes = await fetch('/api/tax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ netProfit: net })
        })
        const taxData = await taxRes.json()
        setTaxEstimate(taxData.quarterlyTax)
      }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your prop firm records</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Payouts</p>
                <p className="text-3xl font-bold text-green-600">₹{totalPayouts.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Payments</p>
                <p className="text-3xl font-bold text-red-600">₹{totalPayments.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="text-3xl">💸</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Net Balance</p>
                <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Quarterly Tax</p>
                <p className="text-3xl font-bold text-orange-600">₹{taxEstimate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prop Firm</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Firm Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">USD</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">INR (with banking)</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(transactions) && transactions.slice(0, 8).map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.propFirm}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.type === 'payout' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.propFirmType === 'futures' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {t.propFirmType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">${t.amountUSD.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">₹{t.amountINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
