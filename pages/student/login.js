import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Nav from '../../components/Nav'

export default function StudentLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('madrassa_student')) {
      router.replace('/welcome')
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username === 'student10' && password === 'pass10') {
      localStorage.setItem('madrassa_student', '1')
      router.push('/welcome')
    } else {
      setError('Invalid student credentials')
    }
  }

  return (
    <div>
      <Nav />
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl font-semibold">Student Login</h2>
        <form onSubmit={handleSubmit} className="mt-6 bg-white p-6 rounded-lg shadow">
          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
          <label className="block">
            <span className="text-sm text-gray-700">Username</span>
            <input value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="student10" />
          </label>

          <label className="block mt-4">
            <span className="text-sm text-gray-700">Password</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="pass10" />
          </label>

          <div className="mt-6 flex items-center justify-between">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">Sign in</button>
            <div className="text-sm text-gray-500">Use username `student10` and password `pass10`</div>
          </div>
        </form>
      </main>
    </div>
  )
}
