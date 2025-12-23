export default function Home() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Welcome to Salsabeel Online Madrassa</h1>
      <p className="mt-4 text-gray-600">Mobile-friendly tuition management. Start by visiting the Teachers section.</p>
      <div className="mt-6 space-y-3">
        <p className="text-sm text-gray-600">Quick login:</p>
        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
          <a href="/teacher/login" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-center">Teacher Login</a>
          <a href="/student/login" className="px-4 py-2 bg-green-600 text-white rounded-md text-center">Student Login</a>
          <a href="/admin/login" className="px-4 py-2 bg-gray-700 text-white rounded-md text-center">Admin Login</a>
        </div>
        <p className="text-xs text-gray-500">Teacher: <strong>teacher1</strong> / <strong>pass1</strong> · Student: <strong>student10</strong> / <strong>pass10</strong></p>
      </div>
    </>
  )
}
