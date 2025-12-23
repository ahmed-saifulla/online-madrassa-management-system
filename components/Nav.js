import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ok = !!(localStorage.getItem('madrassa_admin') || localStorage.getItem('madrassa_teacher') || localStorage.getItem('madrassa_student'))
      setIsLoggedIn(ok)
    }
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('madrassa_admin')
      localStorage.removeItem('madrassa_teacher')
      localStorage.removeItem('madrassa_student')
    }
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold text-indigo-600">Salsabeel</Link>
          </div>

          {isLoggedIn && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/teachers" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Teachers</Link>
              <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Students</button>
              <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Admin</Link>
              <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
            </nav>
          )}

          {isLoggedIn && (
            <div className="md:hidden">
              <button onClick={() => setOpen(!open)} aria-label="Toggle menu" className="p-2 rounded-md inline-flex items-center justify-center text-gray-700 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            </div>
          )}
        </div>
      </div>

      {isLoggedIn && open && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/teachers" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Teachers</Link>
            <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Students</button>
            <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Admin</Link>
            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
          </div>
        </div>
      )}
    </header>
  )
}
