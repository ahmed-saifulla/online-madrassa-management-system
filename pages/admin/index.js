import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Dashboard from '../../components/Dashboard'

export default function AdminIndex() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ok = localStorage.getItem('madrassa_admin')
      if (!ok) router.replace('/admin/login')
    }
  }, [])

  const handleLogout = () => {
    try {
      // lazy-import to avoid SSR issues
      const { clearAuth } = require('../../lib/auth')
      if (clearAuth) clearAuth()
    } catch (e) {}

    router.push('/')
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your institution overview.</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Logout</button>
      </div>
      <Dashboard />
    </>
  )
}
