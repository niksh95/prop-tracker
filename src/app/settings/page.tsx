'use client'

import { useState } from 'react'

export default function Settings() {
  const [bankingCost, setBankingCost] = useState(1.5)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    localStorage.setItem('bankingCost', bankingCost.toString())
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Customize app preferences</p>
        </div>

        {/* Banking Cost */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Banking & Currency</h2>
            <p className="text-gray-600 text-sm">Configure transaction fees and conversion settings</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Default Banking Cost (%)</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  step="0.1"
                  value={bankingCost}
                  onChange={(e) => setBankingCost(parseFloat(e.target.value))}
                  className="w-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <div className="text-sm text-gray-600">
                  <p>Applied to all new transactions</p>
                  <p className="text-xs mt-1">Typical bank fee: 1-2%</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                💡 Example: $1000 × 84 (INR rate) × (1 + {bankingCost}%) = ₹{(1000 * 84 * (1 + bankingCost / 100)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Save Settings
            </button>

            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium">
                ✓ Settings saved successfully!
              </div>
            )}
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Settings</h2>
            <p className="text-gray-600 text-sm">India tax calculation details</p>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Income Tax Slabs (Old Regime)</p>
              <ul className="space-y-1 text-xs">
                <li>• 0 - ₹2,50,000: 0%</li>
                <li>• ₹2,50,000 - ₹5,00,000: 5%</li>
                <li>• ₹5,00,000 - ₹10,00,000: 20%</li>
                <li>• Above ₹10,00,000: 30%</li>
                <li className="font-semibold mt-2">+ 4% Health and Education Cess</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="font-semibold text-yellow-900">⚠️ Important Note</p>
              <p className="text-yellow-800 text-xs mt-2">
                These are estimates based on standard Indian tax slabs. For accurate tax calculations and quarterly advance tax (Form 1040-ES equivalent), consult with a Chartered Accountant or tax professional.
              </p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">About</h2>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">PropTracker v1.0</p>
              <p className="text-xs text-gray-600 mt-1">Prop Firm Payment & Payout Tracker</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-2">Features</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Track payments and payouts in USD</li>
                <li>Automatic INR conversion with banking costs</li>
                <li>Indian tax estimation (quarterly)</li>
                <li>Prop firm-wise P/L analysis</li>
                <li>Detailed reporting and analytics</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-2">Data</p>
              <p className="text-xs">All data is stored locally in your browser. No cloud sync yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}