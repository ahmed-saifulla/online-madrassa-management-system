import { useState, useMemo, useEffect } from 'react'
import { divisions } from '../../data/divisions'
import IconButton from '../../components/IconButton'
import CrudForm from '../../components/CrudForm'

export default function Divisions() {
  const [list, setList] = useState([])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [head, setHead] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editHead, setEditHead] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('madrassa_divisions')
      if (raw) { setList(JSON.parse(raw)); return }
    } catch (e) {}
    setList(divisions.slice())
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(d => (d.name + ' ' + (d.headTeacher || '')).toLowerCase().includes(q))
  }, [list, query])

  function saveToStorage(updated) {
    try { localStorage.setItem('madrassa_divisions', JSON.stringify(updated)) } catch (e) {}
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    const item = { id: 'd' + Date.now(), name: name.trim(), headTeacher: head.trim() || '', active: true }
    setList(prev => { const updated = [item, ...prev]; saveToStorage(updated); return updated })
    try { divisions.unshift(item) } catch (e) {}
    setName(''); setHead(''); setShowForm(false)
  }

  function handleToggleActive(id) {
    setList(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, active: !x.active } : x)
      saveToStorage(updated)
      try { const idx = divisions.findIndex(d=>d.id===id); if (idx>=0) divisions[idx].active = updated.find(u=>u.id===id).active } catch(e){}
      return updated
    })
  }

  function startEdit(d) {
    setEditingId(d.id); setEditName(d.name); setEditHead(d.headTeacher || '')
  }

  function cancelEdit() { setEditingId(null) }

  function saveEdit(e) {
    e.preventDefault()
    if (!editingId) return
    setList(prev => {
      const updated = prev.map(x => x.id === editingId ? { ...x, name: editName.trim() || x.name, headTeacher: editHead.trim() || '' } : x)
      saveToStorage(updated)
      try { updated.forEach(u => { const idx = divisions.findIndex(d=>d.id===u.id); if (idx>=0) divisions[idx] = { ...divisions[idx], ...u } }) } catch(e){}
      return updated
    })
    setEditingId(null)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Divisions</h2>
        <div className="flex items-center gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search divisions..." className="px-3 py-2 border rounded" />
          <IconButton title={showForm ? 'Cancel' : 'Add Division'} onClick={()=>setShowForm(s=>!s)} className="p-2 bg-indigo-600 text-white rounded">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Division name" className="p-2 border rounded" />
              <input value={head} onChange={e=>setHead(e.target.value)} placeholder="Head teacher (optional)" className="p-2 border rounded" />
              <div />
            </div>
          </CrudForm>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map(d => (
          <div key={d.id} className={`bg-white shadow rounded-lg p-4 flex items-center justify-between ${d.active===false ? 'opacity-60' : ''}`}>
            <div>
              <div className="font-medium">{d.name} {d.active===false && <span className="text-xs text-red-500 ml-2">(Deactivated)</span>}</div>
              <div className="text-sm text-gray-500">Head: {d.headTeacher || '—'}</div>
            </div>
            <div className="flex flex-col gap-2">
              {editingId === d.id ? (
                <div className="w-full">
                  <CrudForm onSubmit={saveEdit} onCancel={cancelEdit} saveTitle="Save" cancelTitle="Cancel">
                    <input value={editName} onChange={e=>setEditName(e.target.value)} className="p-2 border rounded" />
                    <input value={editHead} onChange={e=>setEditHead(e.target.value)} className="p-2 border rounded" />
                  </CrudForm>
                </div>
              ) : (
                <>
                  <IconButton title="Edit" onClick={()=>startEdit(d)} className="px-3 py-1 bg-blue-600 text-white rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h6M4 21l7-7 3 3 7-7" />
                    </svg>
                  </IconButton>
                  <IconButton title={d.active===false ? 'Activate' : 'Deactivate'} onClick={()=>handleToggleActive(d.id)} className={`px-3 py-1 rounded ${d.active===false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {d.active===false ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.343 6.343l12.728 12.728" />
                      </svg>
                    )}
                  </IconButton>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-gray-500">No divisions found.</div>}
      </div>
    </>
  )
}
