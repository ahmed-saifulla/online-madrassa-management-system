import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function TeacherLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('madrassa_teacher')) {
      router.replace('/welcome')
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Login is disabled for teachers
    setError('Teacher login is currently disabled. Please contact administrator.')
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <button type="button" onClick={() => router.back()} className="px-3 py-1 bg-gray-200 rounded">Back</button>
      </div>
      <h2 className="text-xl font-semibold">Teacher Login</h2>
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">Teacher logins are temporarily disabled. Please contact the administrator for access.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 bg-white p-6 rounded-lg shadow">
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        <label className="block">
          <span className="text-sm text-gray-700">Username</span>
          <input disabled value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm bg-gray-100" placeholder="teacher1" />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-700">Password</span>
          <input disabled type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm bg-gray-100" placeholder="pass1" />
        </label>

        <div className="mt-6 flex items-center justify-between">
          <button disabled type="submit" className="px-4 py-2 bg-indigo-300 text-white rounded-md">Sign in</button>
          <div className="text-sm text-gray-500">Teacher login disabled</div>
        </div>
      </form>
    </>
  )
}
