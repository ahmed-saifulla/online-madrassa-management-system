import { useState } from 'react'
import Teachers from '../pages/teachers/index'
import Divisions from '../pages/divisions/index'
import Subjects from '../pages/subjects/index'

export default function YearTabs({ yearId }) {
  const [tab, setTab] = useState('teachers')

  return (
    <div>
      <div className="flex items-center gap-2">
        <button onClick={()=>setTab('teachers')} className={`px-3 py-1 rounded ${tab==='teachers' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Teachers</button>
        <button onClick={()=>setTab('divisions')} className={`px-3 py-1 rounded ${tab==='divisions' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Divisions</button>
        <button onClick={()=>setTab('classes')} className={`px-3 py-1 rounded ${tab==='classes' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Classes</button>
        <button onClick={()=>setTab('students')} className={`px-3 py-1 rounded ${tab==='students' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Students</button>
        <button onClick={()=>setTab('subjects')} className={`px-3 py-1 rounded ${tab==='subjects' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Subjects</button>
      </div>

      <div className="mt-4">
        {tab === 'teachers' && <Teachers />}
        {tab === 'divisions' && <Divisions />}
        {tab === 'subjects' && <Subjects />}
        {tab === 'classes' && <div className="text-gray-500">Classes UI (TODO)</div>}
        {tab === 'students' && <div className="text-gray-500">Students UI (TODO)</div>}
        {tab === 'subjects' && <div className="text-gray-500">Subjects UI (TODO)</div>}
      </div>
    </div>
  )
}
