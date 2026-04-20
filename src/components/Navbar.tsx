'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          💰 PropTracker
        </Link>
        <div className="flex gap-6 text-sm md:text-base">
          <Link href="/" className={`pb-2 transition ${isActive('/')}`}>
            Dashboard
          </Link>
          <Link href="/transactions" className={`pb-2 transition ${isActive('/transactions')}`}>
            Transactions
          </Link>
          <Link href="/prop-firm-pl" className={`pb-2 transition ${isActive('/prop-firm-pl')}`}>
            Prop Firm P/L
          </Link>
          <Link href="/reports" className={`pb-2 transition ${isActive('/reports')}`}>
            Reports
          </Link>
          <Link href="/settings" className={`pb-2 transition ${isActive('/settings')}`}>
            Settings
          </Link>
        </div>
        <Link href="/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Add
        </Link>
      </div>
    </nav>
  )
}
