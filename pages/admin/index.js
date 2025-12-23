import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminIndex() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ok = localStorage.getItem('madrassa_admin')
      if (!ok) router.replace('/admin/login')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('madrassa_admin')
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('madrassa_auth_changed'))
    router.push('/')
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="mt-4 text-gray-600">You are signed in as `admin`.</p>
      <div className="mt-6">
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md">Logout</button>
      </div>
    </>
  )
}
