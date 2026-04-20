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

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTxns, setFilteredTxns] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', propFirm: '', search: '' })
  const [propFirms, setPropFirms] = useState<string[]>([])

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
      
      // Extract unique prop firms
      const firms = [...new Set(txnsArray.map((t: Transaction) => t.propFirm))].sort()
      setPropFirms(firms as string[])
      
      applyFilters(txnsArray, filters)
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
        if (res.ok) {
          const updated = transactions.filter(t => t.id !== id)
          setTransactions(updated)
          applyFilters(updated, filters)
        } else {
          alert('Failed to delete transaction')
        }
      } catch (error) {
        alert('Error deleting transaction')
      }
    }
  }

  const applyFilters = (data: Transaction[], currentFilters: typeof filters) => {
    let result = data

    if (currentFilters.type) {
      result = result.filter(t => t.type === currentFilters.type)
    }

    if (currentFilters.propFirm) {
      result = result.filter(t => t.propFirm === currentFilters.propFirm)
    }

    if (currentFilters.search) {
      result = result.filter(t =>
        t.propFirm.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        t.notes?.toLowerCase().includes(currentFilters.search.toLowerCase())
      )
    }

    setFilteredTxns(result)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters(transactions, newFilters)
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
          <h1 className="text-4xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-600">Manage and view all your records</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="payment">Payment</option>
                <option value="payout">Payout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prop Firm</label>
              <select
                value={filters.propFirm}
                onChange={(e) => handleFilterChange('propFirm', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">All Firms</option>
                {propFirms.map(firm => (
                  <option key={firm} value={firm}>{firm}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Search by prop firm or notes..."
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Prop Firm</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Firm Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">USD</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">INR</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Banking Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Notes</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxns.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.propFirm}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        t.type === 'payout' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        t.propFirmType === 'futures' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {t.propFirmType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium">${t.amountUSD.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">₹{t.amountINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">₹{t.bankingCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.notes || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition font-semibold text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTxns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No transactions found</p>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredTxns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-600 text-sm font-medium">Total Records</p>
              <p className="text-3xl font-bold">{filteredTxns.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-600 text-sm font-medium">Total in INR</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{filteredTxns.reduce((sum, t) => sum + t.amountINR, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-600 text-sm font-medium">Total Banking Cost</p>
              <p className="text-3xl font-bold text-red-600">
                ₹{filteredTxns.reduce((sum, t) => sum + t.bankingCost, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}