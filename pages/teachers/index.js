import { useState, useMemo, useEffect } from 'react'
import { teachers } from '../../data/teachers'
import IconButton from '../../components/IconButton'
import CrudForm from '../../components/CrudForm'
import { supabase, hasSupabase } from '../../lib/supabase'

export default function Teachers() {
  const [list, setList] = useState([])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [email, setEmail] = useState('')
  const [salary, setSalary] = useState('')
  const [dateOfJoin, setDateOfJoin] = useState('')
  const [mobile, setMobile] = useState('')
  const [gender, setGender] = useState('Male')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editSalary, setEditSalary] = useState('')
  const [editDateOfJoin, setEditDateOfJoin] = useState('')
  const [editMobile, setEditMobile] = useState('')
  const [editGender, setEditGender] = useState('Male')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(t => (t.name).toLowerCase().includes(q))
  }, [list, query])

  function readFileAsDataURL(file, cb) {
    const reader = new FileReader()
    reader.onload = (e) => cb(e.target.result)
    reader.readAsDataURL(file)
  }

  function handleAvatarChange(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return setAvatar('')
    readFileAsDataURL(f, data => setAvatar(data))
  }

  function handleEditAvatarChange(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    readFileAsDataURL(f, data => setEditAvatar(data))
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    const newTeacher = {
      // keep a temporary id for client-side list; Supabase may overwrite with its id
      id: 't' + Date.now(),
      name: name.trim(),
      avatar: avatar.trim() || `https://i.pravatar.cc/150?u=${Date.now()}`,
      email: email.trim() || '',
      salary: salary.trim() || '0',
      dateOfJoin: dateOfJoin || '',
      mobile: mobile.trim() || '',
      gender: gender || 'Male',
      active: true
    }

    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('teachers').insert(newTeacher).select().single()
        if (error) throw error
        setList(prev => [data, ...prev])
        finishAdd()
        return
      } catch (err) {
        console.error('Supabase insert failed, falling back to localStorage', err)
      }
    }

    setList(prev => {
      const updated = [newTeacher, ...prev]
      try { localStorage.setItem('madrassa_teachers', JSON.stringify(updated)) } catch (e) {}
      try { teachers.unshift(newTeacher) } catch (e) {}
      return updated
    })
    finishAdd()
  }

  function finishAdd() {
    setName('')
    setAvatar('')
    setEmail('')
    setSalary('')
    setDateOfJoin('')
    setMobile('')
    setGender('Male')
    setShowForm(false)
  }

  function saveToStorage(updated) {
    try { localStorage.setItem('madrassa_teachers', JSON.stringify(updated)) } catch (e) {}
  }

  async function handleToggleActive(id) {
    console.log('handleToggleActive called for', id)
    const cur = list.find(t => t.id === id)
    if (!cur) return
    const newActive = !(cur.active === false)

    if (hasSupabase) {
      try {
        const { data, error } = await supabase.from('teachers').update({ active: newActive }).eq('id', id).select().single()
        if (error) throw error
        setList(prev => prev.map(t => t.id === id ? data : t))
        return
      } catch (err) {
        console.error('Supabase update failed, falling back to localStorage', err)
      }
    }

    setList(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, active: newActive } : t)
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
    setEditAvatar(t.avatar)
    setEditEmail(t.email || '')
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

    const updates = {
      name: editName.trim(),
      avatar: editAvatar.trim(),
      email: editEmail.trim(),
      salary: editSalary.trim(),
      dateOfJoin: editDateOfJoin,
      mobile: editMobile.trim(),
      gender: editGender
    }

    if (hasSupabase) {
      ;(async () => {
        try {
          const { data, error } = await supabase.from('teachers').update(updates).eq('id', editingId).select().single()
          if (error) throw error
          setList(prev => prev.map(t => t.id === editingId ? data : t))
        } catch (err) {
          console.error('Supabase update failed, falling back to localStorage', err)
          setList(prev => {
            const updated = prev.map(t => t.id !== editingId ? t : { ...t, ...updates })
            saveToStorage(updated)
            try {
              updated.forEach(u => {
                const idx = teachers.findIndex(x => x.id === u.id)
                if (idx >= 0) teachers[idx] = { ...teachers[idx], ...u }
              })
            } catch (e) {}
            return updated
          })
        }
      })()
    } else {
      setList(prev => {
        const updated = prev.map(t => t.id !== editingId ? t : { ...t, ...updates })
        saveToStorage(updated)
        try {
          updated.forEach(u => {
            const idx = teachers.findIndex(x => x.id === u.id)
            if (idx >= 0) teachers[idx] = { ...teachers[idx], ...u }
          })
        } catch (e) {}
        return updated
      })
    }

    setEditingId(null)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const load = async () => {
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('teachers').select('*')
          if (!error && data) {
            setList(data)
            return
          }
        } catch (err) {
          console.error('Supabase fetch failed, falling back to localStorage', err)
        }
      }

      try {
        const raw = localStorage.getItem('madrassa_teachers')
        if (raw) {
          setList(JSON.parse(raw))
          return
        }
      } catch (e) {}

      // fallback to bundled data
      setList(teachers.slice())
    }

    load()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Teachers</h2>
        <div className="flex items-center gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search teachers..." className="px-3 py-2 border rounded" />
          <IconButton title={showForm ? 'Cancel' : 'Add Teacher'} onClick={() => setShowForm(s => !s)} className="p-2 bg-indigo-600 text-white rounded">
            {showForm ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </IconButton>
        </div>
      </div>

      {showForm && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <CrudForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} saveTitle="Add" cancelTitle="Cancel">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Photo</label>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="p-2 w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className="p-2 border rounded w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Salary</label>
                <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="Salary" className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date of Join</label>
                <input type="date" value={dateOfJoin} onChange={e => setDateOfJoin(e.target.value)} className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mobile</label>
                <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Mobile" className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="p-2 border rounded w-full">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </CrudForm>
        </div>
      )}

      <div className="mt-4 grid gap-4 grid-cols-1">
        {filtered.map(t => (
          <div key={t.id} className={`bg-white shadow rounded-lg p-4 flex items-center space-x-4 ${t.active === false ? 'opacity-60' : ''}`}>
            <img src={t.avatar} alt={t.name} className="h-14 w-14 rounded-full object-cover" />
            <div className="flex-1">
              {editingId === t.id ? (
                <div className="w-full">
                  <CrudForm onSubmit={saveEdit} onCancel={cancelEdit} saveTitle="Save" cancelTitle="Cancel">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Name</label>
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Photo</label>
                          <input type="file" accept="image/*" onChange={handleEditAvatarChange} className="p-2 w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email</label>
                          <input value={editEmail} onChange={e => setEditEmail(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Salary</label>
                          <input value={editSalary} onChange={e => setEditSalary(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Date of Join</label>
                          <input type="date" value={editDateOfJoin} onChange={e => setEditDateOfJoin(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Mobile</label>
                          <input value={editMobile} onChange={e => setEditMobile(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Gender</label>
                          <select value={editGender} onChange={e => setEditGender(e.target.value)} className="p-2 border rounded w-full">
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                  </CrudForm>
                </div>
              ) : (
                <>
                  <div className="font-medium">{t.name} {t.active === false && <span className="text-xs text-red-500 ml-2">(Deactivated)</span>}</div>
                  <div className="text-sm text-gray-500">{t.email && <span className="ml-2 text-sm text-gray-400">• {t.email}</span>}</div>
                  <div className="text-xs text-gray-400 mt-1">{t.gender} • {t.mobile} • Joined {t.dateOfJoin || '—'} • Salary {t.salary || '—'}</div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editingId !== t.id && (
                <>
                  <span className="relative inline-block group">
                    <button type="button" onClick={() => startEdit(t)} title="Edit" aria-label="Edit" className="px-3 py-1 bg-blue-600 text-white rounded flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h6M4 21l7-7 3 3 7-7" />
                      </svg>
                    </button>
                    <span className="pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Edit</span>
                  </span>
                  <span className="relative inline-block group">
                    <button type="button" onClick={() => handleToggleActive(t.id)} title={t.active === false ? 'Activate' : 'Deactivate'} aria-label={t.active === false ? 'Activate' : 'Deactivate'} className={`px-3 py-1 rounded flex items-center justify-center ${t.active === false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
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
