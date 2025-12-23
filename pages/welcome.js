import { useState, useEffect } from 'react'

export default function Welcome() {
  const [role, setRole] = useState('Guest')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('madrassa_admin')) setRole('Admin')
    else if (localStorage.getItem('madrassa_teacher')) setRole('Teacher')
    else if (localStorage.getItem('madrassa_student')) setRole('Student')
  }, [])

  return (
    <>
      <h1 className="text-2xl font-semibold">Welcome, {role}</h1>
      <p className="mt-4 text-gray-600">You are logged in. Use the navigation to explore the application.</p>
    </>
  )
}
