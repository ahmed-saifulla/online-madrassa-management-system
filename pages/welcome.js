import Nav from '../components/Nav'

export default function Welcome() {
  let role = 'Guest'
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('madrassa_admin')) role = 'Admin'
    else if (localStorage.getItem('madrassa_teacher')) role = 'Teacher'
    else if (localStorage.getItem('madrassa_student')) role = 'Student'
  }

  return (
    <div>
      <Nav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-semibold">Welcome, {role}</h1>
        <p className="mt-4 text-gray-600">You are logged in. Use the navigation to explore the application.</p>
      </main>
    </div>
  )
}
