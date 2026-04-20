'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BatchEntry {
  amountUSD: string
  propFirm: string
  propFirmType: string
  type: string
}

export default function AddTransaction() {
  const [batchMode, setBatchMode] = useState(false)
  const [form, setForm] = useState({
    type: 'payout',
    propFirmType: 'futures',
    amountUSD: '',
    amountINRDirect: '',
    date: new Date().toISOString().split('T')[0],
    propFirm: '',
    notes: '',
    bankingCostPercent: '1.5'
  })
  const [batchEntry, setBatchEntry] = useState({
    amountUSD: '',
    amountINRDirect: '',
    propFirm: '',
    propFirmType: 'futures',
    type: 'payout',
    numberOfTransactions: 1
  })
  const [loading, setLoading] = useState(false)
  const [previewINR, setPreviewINR] = useState(0)
  const router = useRouter()

  const handleAmountChange = async (value: string) => {
    setForm({ ...form, amountUSD: value })
    // Skip preview if user has entered a direct INR value
    if (form.amountINRDirect) return
    if (value && !isNaN(parseFloat(value))) {
      try {
        const res = await fetch(`/api/rate?date=${form.date}`)
        const data = await res.json()
        const converted = parseFloat(value) * data.rate
        const bankingCost = converted * (parseFloat(form.bankingCostPercent) / 100)
        setPreviewINR(form.type === 'payout' ? converted - bankingCost : converted + bankingCost)
      } catch (error) {
        console.error('Failed to fetch rate')
      }
    } else {
      setPreviewINR(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amountUSD: parseFloat(form.amountUSD) || 0,
          amountINRDirect: form.amountINRDirect ? parseFloat(form.amountINRDirect) : undefined,
          bankingCostPercent: parseFloat(form.bankingCostPercent)
        })
      })
      if (res.ok) {
        router.push('/')
      } else {
        alert('Failed to add transaction')
      }
    } catch (error) {
      alert('Error adding transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if ((!batchEntry.amountUSD && !batchEntry.amountINRDirect) || !batchEntry.propFirm) {
        alert('Please fill amount (USD or INR) and prop firm')
        setLoading(false)
        return
      }

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batchEntry,
          date: form.date,
          amountUSD: parseFloat(batchEntry.amountUSD) || 0,
          amountINRDirect: batchEntry.amountINRDirect ? parseFloat(batchEntry.amountINRDirect) : undefined,
          type: batchEntry.type,
          propFirmType: batchEntry.propFirmType,
          bankingCostPercent: parseFloat(form.bankingCostPercent),
          count: batchEntry.numberOfTransactions
        })
      })

      if (res.ok) {
        router.push('/')
      } else {
        alert('Failed to add batch transactions')
      }
    } catch (error) {
      alert('Error adding batch transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchAmountChange = async (value: string) => {
    setBatchEntry({ ...batchEntry, amountUSD: value })
    if (batchEntry.amountINRDirect) return
    if (value && !isNaN(parseFloat(value))) {
      try {
        const res = await fetch(`/api/rate?date=${form.date}`)
        const data = await res.json()
        const converted = parseFloat(value) * data.rate
        const bankingCost = converted * (parseFloat(form.bankingCostPercent) / 100)
        setPreviewINR(batchEntry.type === 'payout' ? converted - bankingCost : converted + bankingCost)
      } catch (error) {
        console.error('Failed to fetch rate')
      }
    } else {
      setPreviewINR(0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-700 hover:text-gray-900 text-2xl">
            ←
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add Transaction</h1>
            <p className="text-gray-700">Record a new payment or payout</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex gap-4">
          <button
            onClick={() => setBatchMode(false)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              !batchMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            📝 Single Entry
          </button>
          <button
            onClick={() => setBatchMode(true)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              batchMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            📋 Batch Entry
          </button>
        </div>

        {/* Single Entry Form */}
        {!batchMode && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Transaction Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'payment' })}
                    className={`p-4 rounded-lg border-2 transition font-medium text-gray-900 ${
                      form.type === 'payment' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    💸 Payment (Fee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'payout' })}
                    className={`p-4 rounded-lg border-2 transition font-medium text-gray-900 ${
                      form.type === 'payout' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    📈 Payout (Profit)
                  </button>
                </div>
              </div>

              {/* Prop Firm Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Prop Firm Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, propFirmType: 'futures' })}
                    className={`p-4 rounded-lg border-2 transition font-medium text-gray-900 ${
                      form.propFirmType === 'futures' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    📊 Futures
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, propFirmType: 'cfd' })}
                    className={`p-4 rounded-lg border-2 transition font-medium text-gray-900 ${
                      form.propFirmType === 'cfd' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    💼 CFD
                  </button>
                </div>
              </div>

              {/* Amount USD */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-600 text-lg">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amountUSD}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-lg ${form.amountINRDirect ? 'border-gray-200 bg-gray-50 text-gray-400' : 'border-gray-300'}`}
                    required={!form.amountINRDirect}
                    placeholder="0.00"
                    disabled={!!form.amountINRDirect}
                  />
                </div>
                {previewINR > 0 && !form.amountINRDirect && (
                  <p className="mt-2 text-sm text-blue-700 font-medium">
                    ≈ ₹{previewINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })} (with banking cost)
                  </p>
                )}
              </div>

              {/* Direct INR Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Direct INR Amount <span className="text-gray-500 font-normal">(optional — overrides USD calculation)</span></label>
                <p className="text-xs text-gray-500 mb-3">Fill this if you already know the exact INR received/paid. USD field will be ignored.</p>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-600 text-lg">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amountINRDirect}
                    onChange={(e) => {
                      setForm({ ...form, amountINRDirect: e.target.value })
                      if (e.target.value) setPreviewINR(0)
                    }}
                    className="w-full pl-8 pr-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 text-lg bg-green-50"
                    placeholder="Leave empty to auto-calculate from USD"
                  />
                </div>
                {form.amountINRDirect && (
                  <p className="mt-2 text-sm text-green-700 font-medium">✓ Using direct INR value — USD & banking cost fields ignored</p>
                )}
              </div>

              {/* Prop Firm */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Prop Firm</label>
                <input
                  type="text"
                  value={form.propFirm}
                  onChange={(e) => setForm({ ...form, propFirm: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                  placeholder="e.g., TradingHub, Fintech Firm"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Banking Cost */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Banking Cost (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.bankingCostPercent}
                  onChange={(e) => setForm({ ...form, bankingCostPercent: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="mt-2 text-xs text-gray-700">Typical bank transfer fee: 1-2%</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Notes (Optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={4}
                  placeholder="Add any additional notes..."
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
                >
                  {loading ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Batch Entry Form */}
        {batchMode && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <form onSubmit={handleBatchSubmit} className="space-y-6" noValidate>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-900 font-medium">💡 Enter details for multiple identical transactions. All will use the same date.</p>
              </div>

              {/* Common Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Date (for all entries)</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Banking Cost */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Banking Cost (%) for all</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.bankingCostPercent}
                  onChange={(e) => setForm({ ...form, bankingCostPercent: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Transaction Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBatchEntry({ ...batchEntry, type: 'payment' })}
                    className={`p-4 rounded-lg border-2 transition font-medium text-gray-900 ${
                      batchEntry.type === 'payment' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    💸 Payment (Fee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchEntry({ ...batchEntry, type: 'payout' })}
                    className={`p-4 rounded-lg border-2 transition font-medium text-gray-900 ${
                      batchEntry.type === 'payout' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    📈 Payout (Profit)
                  </button>
                </div>
              </div>

              {/* Prop Firm Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Prop Firm Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBatchEntry({ ...batchEntry, propFirmType: 'futures' })}
                    className={`p-4 rounded-lg border-2 transition font-medium text-gray-900 ${
                      batchEntry.propFirmType === 'futures' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    📊 Futures
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchEntry({ ...batchEntry, propFirmType: 'cfd' })}
                    className={`p-4 rounded-lg border-2 transition font-medium text-gray-900 ${
                      batchEntry.propFirmType === 'cfd' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    💼 CFD
                  </button>
                </div>
              </div>

              {/* Amount USD */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-600 text-lg">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={batchEntry.amountUSD}
                    onChange={(e) => handleBatchAmountChange(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-lg ${batchEntry.amountINRDirect ? 'border-gray-200 bg-gray-50 text-gray-400' : 'border-gray-300'}`}
                    required={!batchEntry.amountINRDirect}
                    placeholder="0.00"
                    disabled={!!batchEntry.amountINRDirect}
                  />
                </div>
                {previewINR > 0 && !batchEntry.amountINRDirect && (
                  <p className="mt-2 text-sm text-blue-700 font-medium">
                    ≈ ₹{previewINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })} (with banking cost)
                  </p>
                )}
              </div>

              {/* Direct INR Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Direct INR Amount <span className="text-gray-500 font-normal">(optional — overrides USD calculation)</span></label>
                <p className="text-xs text-gray-500 mb-3">Fill this if you already know the exact INR received/paid. USD field will be ignored.</p>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-600 text-lg">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={batchEntry.amountINRDirect}
                    onChange={(e) => {
                      setBatchEntry({ ...batchEntry, amountINRDirect: e.target.value })
                      if (e.target.value) setPreviewINR(0)
                    }}
                    className="w-full pl-8 pr-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 text-lg bg-green-50"
                    placeholder="Leave empty to auto-calculate from USD"
                  />
                </div>
                {batchEntry.amountINRDirect && (
                  <p className="mt-2 text-sm text-green-700 font-medium">✓ Using direct INR value — USD & banking cost fields ignored</p>
                )}
              </div>

              {/* Prop Firm */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Prop Firm</label>
                <input
                  type="text"
                  value={batchEntry.propFirm}
                  onChange={(e) => setBatchEntry({ ...batchEntry, propFirm: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                  placeholder="e.g., TradingHub, Fintech Firm"
                />
              </div>

              {/* Number of Transactions */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Number of Transactions</label>
                <input
                  type="number"
                  min="1"
                  value={batchEntry.numberOfTransactions}
                  onChange={(e) => setBatchEntry({ ...batchEntry, numberOfTransactions: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
                >
                  {loading ? 'Adding...' : `Add ${batchEntry.numberOfTransactions} Transaction(s)`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}