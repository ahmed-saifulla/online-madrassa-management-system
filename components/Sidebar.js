import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Sidebar({ open, onClose }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const check = () => {
      const ok = !!(localStorage.getItem('madrassa_admin') || localStorage.getItem('madrassa_teacher') || localStorage.getItem('madrassa_student'))
      setIsLoggedIn(ok)
      setIsAdmin(!!localStorage.getItem('madrassa_admin'))
    }

    check()
    window.addEventListener('madrassa_auth_changed', check)
    return () => window.removeEventListener('madrassa_auth_changed', check)
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('madrassa_admin')
      localStorage.removeItem('madrassa_teacher')
      localStorage.removeItem('madrassa_student')
    }
    router.push('/')
    if (onClose) onClose()
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('madrassa_auth_changed'))
  }

  // Sidebar content - only show when logged in
  const content = (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="px-4 py-6">
        <div className="text-lg font-semibold text-indigo-600">Salsabeel</div>
      </div>
      <nav className="px-2 py-4 space-y-1">
          <Link href="/welcome" onClick={() => onClose && onClose()} className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">Home</Link>
          <Link href="/teachers" onClick={() => onClose && onClose()} className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">Teachers</Link>
          <Link href="/students" onClick={() => onClose && onClose()} className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">Students</Link>
          <Link href="/divisions" onClick={() => onClose && onClose()} className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">Divisions</Link>
          <Link href="/subjects" onClick={() => onClose && onClose()} className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">Subjects</Link>
          <Link href="/classes" onClick={() => onClose && onClose()} className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">Classes</Link>
          {isAdmin && (
            <Link href="/admin/academic-years" onClick={() => onClose && onClose()} className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">Academic Years</Link>
          )}
      </nav>
      <div className="mt-auto px-2 py-4">
        <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50">Logout</button>
      </div>
    </div>
  )

  // Desktop sidebar
  return (
    <>
      <aside className="hidden md:block w-64 h-screen fixed left-0 top-0">{isLoggedIn ? content : null}</aside>

      {/* Mobile overlay drawer */}
      {isLoggedIn && open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r shadow-lg">{content}</div>
        </div>
      )}
    </>
  )
}
