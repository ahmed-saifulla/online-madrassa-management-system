import { useState, useMemo, useEffect } from 'react'
import IconButton from '../../components/IconButton'
import { teachers as defaultTeachers } from '../../data/teachers'
import { divisions as defaultDivisions } from '../../data/divisions'

export default function Subjects() {
  const [list, setList] = useState([])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [classId, setClassId] = useState('')
  const [divisionId, setDivisionId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editClassId, setEditClassId] = useState('')
  const [editDivisionId, setEditDivisionId] = useState('')
  const [editTeacherId, setEditTeacherId] = useState('')

  const [teachers, setTeachers] = useState([])
  const [divisions, setDivisions] = useState([])
  const [classes, setClasses] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('madrassa_subjects')
      if (raw) { setList(JSON.parse(raw)); } else setList([])
    } catch (e) { setList([]) }

    try {
      const tRaw = localStorage.getItem('madrassa_teachers')
      setTeachers(tRaw ? JSON.parse(tRaw) : defaultTeachers.slice())
    } catch (e) { setTeachers(defaultTeachers.slice()) }

    try {
      const dRaw = localStorage.getItem('madrassa_divisions')
      setDivisions(dRaw ? JSON.parse(dRaw) : defaultDivisions.slice())
    } catch (e) { setDivisions(defaultDivisions.slice()) }
    try {
      const cRaw = localStorage.getItem('madrassa_classes')
      setClasses(cRaw ? JSON.parse(cRaw) : [])
    } catch (e) { setClasses([]) }
  }, [])

  function saveToStorage(updated) {
    try { localStorage.setItem('madrassa_subjects', JSON.stringify(updated)) } catch (e) {}
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(s => (s.name + ' ' + (s.className||'') + ' ' + (s.divisionName||'') + ' ' + (s.teacherName||'')).toLowerCase().includes(q))
  }, [list, query])

  function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    const t = teachers.find(x => x.id === teacherId)
    const c = classes.find(x => x.id === classId)
    const d = divisions.find(x => x.id === divisionId)
    const newItem = {
      id: 'sub' + Date.now(),
      name: name.trim(),
      classId: classId || '',
      className: c ? c.name : '',
      divisionId: divisionId || '',
      divisionName: d ? d.name : '',
      teacherId: teacherId || '',
      teacherName: t ? t.name : '',
      active: true
    }
    setList(prev => { const updated = [newItem, ...prev]; saveToStorage(updated); return updated })
    setName(''); setClassId(''); setDivisionId(''); setTeacherId(''); setShowForm(false)
  }

  function startEdit(s) {
    setEditingId(s.id)
    setEditName(s.name)
    setEditClassId(s.classId || '')
    setEditDivisionId(s.divisionId || '')
    setEditTeacherId(s.teacherId || '')
  }

  function cancelEdit() { setEditingId(null) }

  function saveEdit(e) {
    e.preventDefault()
    if (!editingId) return
    setList(prev => {
      const updated = prev.map(it => {
        if (it.id !== editingId) return it
        const t = teachers.find(x => x.id === editTeacherId)
        const c = classes.find(x => x.id === editClassId)
        const d = divisions.find(x => x.id === editDivisionId)
        return { ...it, name: editName.trim() || it.name, classId: editClassId || '', className: c ? c.name : '', divisionId: editDivisionId || '', divisionName: d ? d.name : '', teacherId: editTeacherId || '', teacherName: t ? t.name : '' }
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
        <h2 className="text-xl font-semibold">Subjects</h2>
        <div className="flex items-center gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search subjects..." className="px-3 py-2 border rounded" />
          <IconButton title={showForm ? 'Cancel' : 'Add Subject'} onClick={() => setShowForm(s => !s)} className="p-2 bg-indigo-600 text-white rounded">
            {showForm ? '×' : '+'}
          </IconButton>
        </div>
      </div>

      {showForm && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Subject name" className="p-2 border rounded" />
              <select value={classId} onChange={e=>setClassId(e.target.value)} className="p-2 border rounded">
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={divisionId} onChange={e=>setDivisionId(e.target.value)} className="p-2 border rounded">
                <option value="">Select division</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={teacherId} onChange={e=>setTeacherId(e.target.value)} className="p-2 border rounded">
                <option value="">Select teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Add</button>
              <button type="button" onClick={()=>setShowForm(false)} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map(s => (
          <div key={s.id} className={`bg-white shadow rounded-lg p-4 flex items-center justify-between ${s.active === false ? 'opacity-60' : ''}`}>
            <div>
              <div className="font-medium">{s.name} {s.active === false && <span className="text-xs text-red-500 ml-2">(Deactivated)</span>}</div>
              <div className="text-sm text-gray-500">Class: {s.className || '—'} · Division: {s.divisionName || '—'} · Teacher: {s.teacherName || '—'}</div>
            </div>
            <div className="flex flex-col gap-2">
              {editingId !== s.id && (
                <>
                  <IconButton title="Edit" onClick={()=>startEdit(s)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</IconButton>
                  <IconButton title={s.active === false ? 'Activate' : 'Deactivate'} onClick={()=>toggleActive(s.id)} className={`px-3 py-1 rounded ${s.active===false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {s.active === false ? 'Activate' : 'Deactivate'}
                  </IconButton>
                </>
              )}
              {editingId === s.id && (
                <div className="w-full">
                  <form onSubmit={saveEdit} className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input value={editName} onChange={e=>setEditName(e.target.value)} className="p-2 border rounded" />
                      <select value={editClassId} onChange={e=>setEditClassId(e.target.value)} className="p-2 border rounded">
                        <option value="">Select class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <select value={editDivisionId} onChange={e=>setEditDivisionId(e.target.value)} className="p-2 border rounded">
                        <option value="">Select division</option>
                        {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <select value={editTeacherId} onChange={e=>setEditTeacherId(e.target.value)} className="p-2 border rounded">
                        <option value="">Select teacher</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
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
          <div className="text-gray-500">No subjects found.</div>
        )}
      </div>
    </>
  )
}
