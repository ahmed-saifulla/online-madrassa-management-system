import { useState, useMemo, useEffect } from 'react'
import { teachers } from '../../data/teachers'

export default function Teachers() {
  const [list, setList] = useState([])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [avatar, setAvatar] = useState('')
  const [salary, setSalary] = useState('')
  const [dateOfJoin, setDateOfJoin] = useState('')
  const [mobile, setMobile] = useState('')
  const [gender, setGender] = useState('Male')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editSalary, setEditSalary] = useState('')
  const [editDateOfJoin, setEditDateOfJoin] = useState('')
  const [editMobile, setEditMobile] = useState('')
  const [editGender, setEditGender] = useState('Male')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(t => (t.name + ' ' + t.subject).toLowerCase().includes(q))
  }, [list, query])

  function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    const newTeacher = {
      id: 't' + Date.now(),
      name: name.trim(),
      subject: subject.trim() || '—',
      avatar: avatar.trim() || `https://i.pravatar.cc/150?u=${Date.now()}`,
      salary: salary.trim() || '0',
      dateOfJoin: dateOfJoin || '',
      mobile: mobile.trim() || '',
      gender: gender || 'Male'
    }
    newTeacher.active = true
    setList(prev => {
      const updated = [newTeacher, ...prev]
      try { localStorage.setItem('madrassa_teachers', JSON.stringify(updated)) } catch (e) {}
      return updated
    })
    // also update module export so other pages see it during this session
    try { teachers.unshift(newTeacher) } catch (e) {}
    setName('')
    setSubject('')
    setAvatar('')
    setSalary('')
    setDateOfJoin('')
    setMobile('')
    setGender('Male')
    setShowForm(false)
  }

  function saveToStorage(updated) {
    try { localStorage.setItem('madrassa_teachers', JSON.stringify(updated)) } catch (e) {}
  }

  function handleToggleActive(id) {
    setList(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, active: !t.active } : t)
      saveToStorage(updated)
      try {
        const idx = teachers.findIndex(x => x.id === id)
        if (idx >= 0) teachers[idx].active = updated.find(x => x.id === id).active
      } catch (e) {}
      return updated
    })
  }

  function startEdit(t) {
    setEditingId(t.id)
    setEditName(t.name)
    setEditSubject(t.subject)
    setEditAvatar(t.avatar)
    setEditSalary(t.salary || '')
    setEditDateOfJoin(t.dateOfJoin || '')
    setEditMobile(t.mobile || '')
    setEditGender(t.gender || 'Male')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function saveEdit(e) {
    e.preventDefault()
    if (!editingId) return
    setList(prev => {
      const updated = prev.map(t => {
        if (t.id !== editingId) return t
        return {
          ...t,
          name: editName.trim() || t.name,
          subject: editSubject.trim() || t.subject,
          avatar: editAvatar.trim() || t.avatar,
          salary: editSalary.trim() || t.salary,
          dateOfJoin: editDateOfJoin || t.dateOfJoin,
          mobile: editMobile.trim() || t.mobile,
          gender: editGender || t.gender
        }
      })
      saveToStorage(updated)
      try {
        updated.forEach(u => {
          const idx = teachers.findIndex(x => x.id === u.id)
          if (idx >= 0) teachers[idx] = { ...teachers[idx], ...u }
        })
      } catch (e) {}
      return updated
    })
    setEditingId(null)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('madrassa_teachers')
      if (raw) {
        setList(JSON.parse(raw))
        return
      }
    } catch (e) {}
    // fallback to bundled data
    setList(teachers.slice())
  }, [])

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Teachers</h2>
        <div className="flex items-center gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search teachers..." className="px-3 py-2 border rounded" />
          <span className="relative inline-block group">
            <button onClick={() => setShowForm(s => !s)} title={showForm ? 'Cancel' : 'Add Teacher'} aria-label={showForm ? 'Cancel' : 'Add Teacher'} className="p-2 bg-indigo-600 text-white rounded flex items-center justify-center">
              {showForm ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
            <span className="pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">{showForm ? 'Cancel' : 'Add Teacher'}</span>
          </span>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 bg-white p-4 rounded shadow">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="p-2 border rounded" />
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="p-2 border rounded" />
            <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar URL (optional)" className="p-2 border rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
            <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="Salary" className="p-2 border rounded" />
            <input type="date" value={dateOfJoin} onChange={e => setDateOfJoin(e.target.value)} className="p-2 border rounded" />
            <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Mobile" className="p-2 border rounded" />
            <select value={gender} onChange={e => setGender(e.target.value)} className="p-2 border rounded">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="mt-3">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add</button>
          </div>
        </form>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map(t => (
          <div key={t.id} className={`bg-white shadow rounded-lg p-4 flex items-center space-x-4 ${t.active === false ? 'opacity-60' : ''}`}>
            <img src={t.avatar} alt={t.name} className="h-14 w-14 rounded-full object-cover" />
            <div className="flex-1">
              {editingId === t.id ? (
                <form onSubmit={saveEdit} className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="p-2 border rounded" />
                    <input value={editSubject} onChange={e => setEditSubject(e.target.value)} className="p-2 border rounded" />
                    <input value={editAvatar} onChange={e => setEditAvatar(e.target.value)} className="p-2 border rounded" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input value={editSalary} onChange={e => setEditSalary(e.target.value)} className="p-2 border rounded" />
                    <input type="date" value={editDateOfJoin} onChange={e => setEditDateOfJoin(e.target.value)} className="p-2 border rounded" />
                    <input value={editMobile} onChange={e => setEditMobile(e.target.value)} className="p-2 border rounded" />
                    <select value={editGender} onChange={e => setEditGender(e.target.value)} className="p-2 border rounded">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="relative inline-block group">
                      <button type="submit" title="Save" aria-label="Save" className="px-3 py-1 bg-green-600 text-white rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <span className="pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Save</span>
                    </span>
                    <span className="relative inline-block group">
                      <button type="button" onClick={cancelEdit} title="Cancel" aria-label="Cancel" className="px-3 py-1 bg-gray-200 rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className="pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Cancel</span>
                    </span>
                  </div>
                </form>
              ) : (
                <>
                  <div className="font-medium">{t.name} {t.active === false && <span className="text-xs text-red-500 ml-2">(Deactivated)</span>}</div>
                  <div className="text-sm text-gray-500">{t.subject}</div>
                  <div className="text-xs text-gray-400 mt-1">{t.gender} • {t.mobile} • Joined {t.dateOfJoin || '—'} • Salary {t.salary || '—'}</div>
                </>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {editingId !== t.id && (
                <>
                  <span className="relative inline-block group">
                    <button onClick={() => startEdit(t)} title="Edit" aria-label="Edit" className="px-3 py-1 bg-blue-600 text-white rounded flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h6M4 21l7-7 3 3 7-7" />
                      </svg>
                    </button>
                    <span className="pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Edit</span>
                  </span>
                  <span className="relative inline-block group">
                    <button onClick={() => handleToggleActive(t.id)} title={t.active === false ? 'Activate' : 'Deactivate'} aria-label={t.active === false ? 'Activate' : 'Deactivate'} className={`px-3 py-1 rounded flex items-center justify-center ${t.active === false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {t.active === false ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.343 6.343l12.728 12.728" />
                        </svg>
                      )}
                    </button>
                    <span className="pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">{t.active === false ? 'Activate' : 'Deactivate'}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-gray-500">No teachers found.</div>
        )}
      </div>
    </>
  )
}
