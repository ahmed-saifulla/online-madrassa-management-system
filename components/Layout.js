import { useState } from 'react'
import Sidebar from './Sidebar'
import Link from 'next/link'
import YearSelector from './YearSelector'

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="md:hidden bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 rounded-md inline-flex items-center justify-center text-gray-700 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="text-lg font-semibold text-indigo-600">Salsabeel</Link>
            <div className="w-8" />
            <div className="flex items-center">
              <YearSelector />
            </div>
          </div>
        </div>
      </header>

      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Desktop top-right year selector */}
      <div className="hidden md:block fixed right-6 top-4 z-50">
        <YearSelector />
      </div>

      <div className="md:pl-64">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
