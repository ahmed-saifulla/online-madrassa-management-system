import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Dashboard from '../components/Dashboard'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAdminLoggedIn = !!localStorage.getItem('madrassa_admin')
      if (!isAdminLoggedIn) {
        router.replace('/admin/login')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('madrassa_admin')
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('madrassa_auth_changed'))
    router.push('/')
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Institution management overview</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Logout</button>
      </div>
      <Dashboard />
    </>
  )
}
