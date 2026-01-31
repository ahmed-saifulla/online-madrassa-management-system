import { useState, useEffect, useMemo } from 'react'
import IconButton from '../../../components/IconButton'
import MigrateModal from '../../../components/MigrateModal'

export default function AcademicYearsPage() {
  const [years, setYears] = useState([])
  const [name, setName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [showMigrate, setShowMigrate] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('madrassa_academic_years')
      if (raw) { setYears(JSON.parse(raw)); return }
    } catch (e) {}
    setYears([])
  }, [])

  const filteredYears = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return years
    return years.filter(y => y.name.toLowerCase().includes(q))
  }, [years, searchQuery])

  function persist(updated) {
    try { localStorage.setItem('madrassa_academic_years', JSON.stringify(updated)) } catch (e) {}
    setYears(updated)
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    const newYear = { id: 'y' + Date.now(), name: name.trim(), createdAt: Date.now() }
    persist([newYear, ...years])
    setName('')
    setShowForm(false)
    try { localStorage.setItem('madrassa_active_year', newYear.id) } catch (e) {}
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('madrassa_year_changed'))
    setNotice('Academic year added')
    setTimeout(()=>setNotice(''), 1800)
  }

  function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }
    const updated = years.filter(y => y.id !== id)
    persist(updated)
    try {
      const active = localStorage.getItem('madrassa_active_year')
      if (active === id) {
        localStorage.removeItem('madrassa_active_year')
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('madrassa_year_changed'))
      }
    } catch (e) {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Academic Years</h2>
        <div className="flex items-center gap-2">
          <button onClick={()=>setShowForm(!showForm)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            {showForm ? 'Cancel' : 'Add New'}
          </button>
          {notice && <div className="text-sm text-green-600">{notice}</div>}
          <IconButton title="Migrate data" onClick={()=>setShowMigrate(true)} className="px-3 py-2 bg-green-600 text-white rounded">Migrate</IconButton>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-4 rounded shadow mb-4 flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year Name</label>
            <input 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="e.g. 2024-2025" 
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
        </form>
      )}

      <div className="mb-4">
        <input 
          value={searchQuery}
          onChange={e=>setSearchQuery(e.target.value)}
          placeholder="Search academic years..."
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="mt-4">
        {filteredYears.length === 0 ? (
          <div className="text-gray-500">
            {searchQuery ? 'No academic years match your search.' : 'No academic years yet. Add one above.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredYears.map(y => (
              <div key={y.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={()=>{ try{ localStorage.setItem('madrassa_active_year', y.id) }catch(e){}; if(typeof window !== 'undefined') window.dispatchEvent(new Event('madrassa_year_changed')) }} className="text-left hover:opacity-75">
                    <div className="font-medium">{y.name}</div>
                    <div className="text-xs text-gray-500">Created {new Date(y.createdAt).toLocaleString()}</div>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton title="Delete" onClick={()=>handleDelete(y.id, y.name)} className="px-3 py-1 bg-red-500 text-white rounded">Del</IconButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="text-gray-500">Use the year selector (top right) to choose an active academic year. Manage years here by adding, deleting or migrating data.</div>
      </div>

      {showMigrate && (
        <MigrateModal years={years} onClose={()=>setShowMigrate(false)} onMigrate={(from,to)=>{
          // simple mock: copy localStorage keys that start with madrassa_ from source year to target year
          try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('madrassa_') && !k.startsWith('madrassa_academic_years'))
            keys.forEach(k => {
              const v = localStorage.getItem(k)
              // target key pattern: `${k}__${to}`
              localStorage.setItem(k + '__' + to, v)
            })
          } catch (e) {}
          setShowMigrate(false)
        }} />
      )}
    </div>
  )
}
