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

interface MonthlyData {
  month: string
  payouts: number
  payments: number
  net: number
}

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPayouts, setTotalPayouts] = useState(0)
  const [totalPayments, setTotalPayments] = useState(0)
  const [totalTax, setTotalTax] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      
      // Ensure data is an array
      const txnsArray = Array.isArray(data) ? data : []
      setTransactions(txnsArray)

      // Calculate totals
      const payments = txnsArray.filter((t: Transaction) => t.type === 'payment').reduce((sum: number, t: Transaction) => sum + t.amountINR, 0)
      const payouts = txnsArray.filter((t: Transaction) => t.type === 'payout').reduce((sum: number, t: Transaction) => sum + t.amountINR, 0)
      
      setTotalPayments(payments)
      setTotalPayouts(payouts)

      // Calculate tax
      const net = payouts - payments
      if (net > 0) {
        const taxRes = await fetch('/api/tax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ netProfit: net })
        })
        const taxData = await taxRes.json()
        setTotalTax(taxData.tax)
      }

      // Group by month
      const grouped: { [key: string]: Transaction[] } = {}
      txnsArray.forEach((t: Transaction) => {
        const month = new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        if (!grouped[month]) grouped[month] = []
        grouped[month].push(t)
      })

      const monthly = Object.entries(grouped).map(([month, txns]) => {
        const monthPayments = txns.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amountINR, 0)
        const monthPayouts = txns.filter(t => t.type === 'payout').reduce((sum, t) => sum + t.amountINR, 0)
        return {
          month,
          payouts: monthPayouts,
          payments: monthPayments,
          net: monthPayouts - monthPayments
        }
      })

      setMonthlyData(monthly)
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
          <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Detailed insights and tax preparation data</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm font-medium">Total Payouts</p>
            <p className="text-3xl font-bold text-green-600">₹{totalPayouts.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-gray-500 mt-2">${(totalPayouts / 84).toFixed(0)} USD (approx)</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm font-medium">Total Payments</p>
            <p className="text-3xl font-bold text-red-600">₹{totalPayments.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-gray-500 mt-2">${(totalPayments / 84).toFixed(0)} USD (approx)</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm font-medium">Net Profit</p>
            <p className="text-3xl font-bold text-blue-600">₹{(totalPayouts - totalPayments).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm font-medium">Annual Tax Est.</p>
            <p className="text-3xl font-bold text-orange-600">₹{totalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-gray-500 mt-2">Quarterly: ₹{(totalTax / 4).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Monthly Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Month</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Payouts</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Payments</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Net P/L</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Tax (Quarterly)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, idx) => {
                  const quarterlyTax = month.net > 0 ? ((month.net / 4) * 0.30 + (month.net / 4) * 0.30 * 0.04) : 0
                  return (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{month.month}</td>
                      <td className="px-6 py-4 text-sm text-right text-green-600 font-semibold">₹{month.payouts.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 text-sm text-right text-red-600 font-semibold">₹{month.payments.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold">₹{month.net.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 text-sm text-right text-orange-600 font-semibold">₹{quarterlyTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📋 Tax Information</h3>
          <p className="text-blue-800 text-sm mb-4">
            Based on Indian income tax (old regime) with 4% cess. <strong>This is an estimate only.</strong> Consult a tax professional.
          </p>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Net Profit: <strong>₹{(totalPayouts - totalPayments).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></li>
            <li>• Estimated Annual Tax: <strong>₹{totalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></li>
            <li>• Quarterly Advance Tax: <strong>₹{(totalTax / 4).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  )
}