import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { API_BASE } from '../../lib/api'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const formRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('madrassa_admin')) {
      router.replace('/admin')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.message || 'Login failed')
        return
      }

      // store tokens if provided
      if (data?.data?.access_token) {
        localStorage.setItem('access_token', data.data.access_token)
      }
      if (data?.data?.refresh_token) {
        localStorage.setItem('refresh_token', data.data.refresh_token)
      }

      // mark admin locally and notify
      localStorage.setItem('madrassa_admin', '1')
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('madrassa_auth_changed'))
      router.push('/welcome')
    } catch (err) {
      console.error('Login error', err)
      setError('Unable to reach auth server')
    }
  }

  const demoLogin = () => {
    setUsername('superadmin@school.com')
    setPassword('salsabeel')

    // ensure state updates before submitting
    requestAnimationFrame(() => {
      if (formRef.current && typeof formRef.current.requestSubmit === 'function') {
        formRef.current.requestSubmit()
      } else if (formRef.current) {
        formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <button type="button" onClick={() => router.back()} className="px-3 py-1 bg-gray-200 rounded">Back</button>
      </div>
      <h2 className="text-xl font-semibold">Admin Login</h2>
      <form ref={formRef} onSubmit={handleSubmit} className="mt-6 bg-white p-6 rounded-lg shadow">
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        <label className="block">
          <span className="text-sm text-gray-700">Email</span>
          <input type="email" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-700">Password</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </label>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button type="button" onClick={demoLogin} className="px-4 py-2 bg-green-500 text-white rounded-md">Demo login</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Sign in</button>
          </div>
        </div>
      </form>
    </>
  )
}
