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
    if (username === 'teacher1' && password === 'pass1') {
      localStorage.setItem('madrassa_teacher', '1')
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('madrassa_auth_changed'))
      router.push('/welcome')
    } else {
      setError('Invalid teacher credentials')
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold">Teacher Login</h2>
      <form onSubmit={handleSubmit} className="mt-6 bg-white p-6 rounded-lg shadow">
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        <label className="block">
          <span className="text-sm text-gray-700">Username</span>
          <input value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="teacher1" />
        </label>

        <label className="block mt-4">
          <span className="text-sm text-gray-700">Password</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="pass1" />
        </label>

        <div className="mt-6 flex items-center justify-between">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Sign in</button>
          <div className="text-sm text-gray-500">Use username `teacher1` and password `pass1`</div>
        </div>
      </form>
    </>
  )
}
