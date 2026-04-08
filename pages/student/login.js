import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { API_BASE } from '../../lib/api'

export default function StudentLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const router = useRouter()
  const formRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('madrassa_student')) {
      router.replace('/welcome')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setToast('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data?.message || 'Login failed'); setLoading(false); return }

      // role validation
      const role = data?.data?.role
      if (role !== 'STUDENT') {
        setError('Account is not a student')
        setLoading(false)
        return
      }

      if (data?.data?.access_token) localStorage.setItem('access_token', data.data.access_token)
      if (data?.data?.refresh_token) localStorage.setItem('refresh_token', data.data.refresh_token)

      localStorage.setItem('madrassa_student', '1')
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('madrassa_auth_changed'))
      const target = role === 'STUDENT' ? '/student' : '/welcome'
      setToast('Login successful')
      router.push(target)
    } catch (err) {
      console.error('Student login error', err)
      setError('Unable to reach auth server')
    }
    setLoading(false)
  }

  const demoLogin = () => {
    setUsername('student@example.com')
    setPassword('Password@123')
    requestAnimationFrame(() => {
      if (formRef.current && typeof formRef.current.requestSubmit === 'function') formRef.current.requestSubmit()
      else if (formRef.current) formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <button type="button" onClick={() => router.back()} className="px-3 py-1 bg-gray-200 rounded">Back</button>
      </div>
      <h2 className="text-xl font-semibold">Student Login</h2>
      <form ref={formRef} onSubmit={handleSubmit} className="mt-6 bg-white p-6 rounded-lg shadow">
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {toast && <div className="text-sm text-green-600 mb-3">{toast}</div>}
        <label className="block">
          <span className="text-sm text-gray-700">Email</span>
          <input type="email" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" placeholder="student@example.com" />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-700">Password</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" placeholder="Password" />
        </label>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button type="button" onClick={demoLogin} className="px-4 py-2 bg-green-500 text-white rounded-md" disabled={loading}>{loading ? 'Working...' : 'Demo login'}</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </div>
          <div className="text-sm text-gray-500">Student access</div>
        </div>
      </form>
    </>
  )
}
