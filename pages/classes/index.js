import { useState, useEffect, useMemo } from 'react'
import IconButton from '../../components/IconButton'
import { teachers as defaultTeachers } from '../../data/teachers'

export default function Classes() {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [teacherId, setTeacherId] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editSubjects, setEditSubjects] = useState([])
  const [editTeacherId, setEditTeacherId] = useState('')

  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('madrassa_classes')
      if (raw) setList(JSON.parse(raw))
      else setList([])
    } catch (e) { setList([]) }

    try {
      const tRaw = localStorage.getItem('madrassa_teachers')
      setTeachers(tRaw ? JSON.parse(tRaw) : defaultTeachers.slice())
    } catch (e) { setTeachers(defaultTeachers.slice()) }

    try {
      const sRaw = localStorage.getItem('madrassa_subjects')
      setSubjects(sRaw ? JSON.parse(sRaw) : [])
    } catch (e) { setSubjects([]) }
  }, [])

  function saveToStorage(updated) {
    try { localStorage.setItem('madrassa_classes', JSON.stringify(updated)) } catch (e) {}
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(c => (c.name + ' ' + (c.subjectNames||'') + ' ' + (c.teacherName||'')).toLowerCase().includes(q))
  }, [list, query])

  function toggleSubject(id) {
    setSelectedSubjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    const t = teachers.find(x => x.id === teacherId)
    const subs = subjects.filter(s => selectedSubjects.includes(s.id))
    const newItem = {
      id: 'cls' + Date.now(),
      name: name.trim(),
      subjectIds: selectedSubjects.slice(),
      subjectNames: subs.map(s=>s.name).join(', '),
      teacherId: teacherId || '',
      teacherName: t ? t.name : '',
      active: true
    }
    setList(prev => { const updated = [newItem, ...prev]; saveToStorage(updated); return updated })
    setName(''); setSelectedSubjects([]); setTeacherId(''); setShowForm(false)
  }

  function startEdit(c) {
    setEditingId(c.id)
    setEditName(c.name)
    setEditSubjects(c.subjectIds ? c.subjectIds.slice() : [])
    setEditTeacherId(c.teacherId || '')
  }

  function cancelEdit() { setEditingId(null) }

  function saveEdit(e) {
    e.preventDefault()
    if (!editingId) return
    setList(prev => {
      const updated = prev.map(it => {
        if (it.id !== editingId) return it
        const t = teachers.find(x => x.id === editTeacherId)
        const subs = subjects.filter(s => (editSubjects || []).includes(s.id))
        return { ...it, name: editName.trim() || it.name, subjectIds: (editSubjects||[]).slice(), subjectNames: subs.map(s=>s.name).join(', '), teacherId: editTeacherId || '', teacherName: t ? t.name : '' }
      })
      saveToStorage(updated)
      return updated
    })
    setEditingId(null)
  }

  function toggleActive(id) {
    setList(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, active: !i.active } : i)
      saveToStorage(updated)
      return updated
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Classes</h2>
        <div className="flex items-center gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search classes..." className="px-3 py-2 border rounded" />
          <IconButton title={showForm ? 'Cancel' : 'Add Class'} onClick={() => setShowForm(s => !s)} className="p-2 bg-indigo-600 text-white rounded">
            {showForm ? '×' : '+'}
          </IconButton>
        </div>
      </div>

      {showForm && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Class name" className="p-2 border rounded" />
                <select value={teacherId} onChange={e=>setTeacherId(e.target.value)} className="p-2 border rounded">
                  <option value="">Select class teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="p-2 border rounded max-h-40 overflow-auto">
                {subjects.length === 0 && <div className="text-sm text-gray-500">No subjects</div>}
                {subjects.map(s => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedSubjects.includes(s.id)} onChange={() => toggleSubject(s.id)} />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Add</button>
              <button type="button" onClick={()=>setShowForm(false)} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map(c => (
          <div key={c.id} className={`bg-white shadow rounded-lg p-4 flex items-center justify-between ${c.active === false ? 'opacity-60' : ''}`}>
            <div>
              <div className="font-medium">{c.name} {c.active === false && <span className="text-xs text-red-500 ml-2">(Deactivated)</span>}</div>
              <div className="text-sm text-gray-500">Subjects: {c.subjectNames || '—'} · Teacher: {c.teacherName || '—'}</div>
            </div>
            <div className="flex flex-col gap-2">
              {editingId !== c.id && (
                <>
                  <IconButton title="Edit" onClick={()=>startEdit(c)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</IconButton>
                  <IconButton title={c.active === false ? 'Activate' : 'Deactivate'} onClick={()=>toggleActive(c.id)} className={`px-3 py-1 rounded ${c.active===false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {c.active === false ? 'Activate' : 'Deactivate'}
                  </IconButton>
                </>
              )}
              {editingId === c.id && (
                <div className="w-full">
                  <form onSubmit={saveEdit} className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input value={editName} onChange={e=>setEditName(e.target.value)} className="p-2 border rounded" />
                          <select value={editTeacherId} onChange={e=>setEditTeacherId(e.target.value)} className="p-2 border rounded">
                            <option value="">Select teacher</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </div>
                        <div className="p-2 border rounded max-h-40 overflow-auto">
                          {subjects.length === 0 && <div className="text-sm text-gray-500">No subjects</div>}
                          {subjects.map(s => (
                            <label key={s.id} className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={(editSubjects||[]).includes(s.id)} onChange={() => {
                                setEditSubjects(prev => prev && prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...(prev||[]), s.id])
                              }} />
                              <span>{s.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    <div className="flex items-center gap-2">
                      <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>
                      <button type="button" onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-gray-500">No classes found.</div>
        )}
      </div>
    </>
  )
}
