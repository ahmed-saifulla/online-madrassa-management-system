import { useState, useEffect, useMemo } from 'react'
import IconButton from '../../components/IconButton'

export default function Students() {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')

  const [name, setName] = useState('')
  const [regNo, setRegNo] = useState('')
  const [classId, setClassId] = useState('')
  const [photo, setPhoto] = useState('')
  const [dateAdmission, setDateAdmission] = useState('')
  const [dob, setDob] = useState('')
  const [mobile, setMobile] = useState('')

  const [fatherName, setFatherName] = useState('')
  const [fatherPhone, setFatherPhone] = useState('')
  const [fatherProfession, setFatherProfession] = useState('')
  const [motherName, setMotherName] = useState('')
  const [motherPhone, setMotherPhone] = useState('')
  const [motherProfession, setMotherProfession] = useState('')

  const [siblings, setSiblings] = useState([])
  const [sibSearch, setSibSearch] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState(null)

  const [classes, setClasses] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('madrassa_students')
      setList(raw ? JSON.parse(raw) : [])
    } catch (e) { setList([]) }
    try {
      const cRaw = localStorage.getItem('madrassa_classes')
      setClasses(cRaw ? JSON.parse(cRaw) : [])
    } catch (e) { setClasses([]) }
  }, [])

  function saveToStorage(updated) {
    try { localStorage.setItem('madrassa_students', JSON.stringify(updated)) } catch (e) {}
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(s => (s.name + ' ' + (s.regNo||'') + ' ' + (s.className||'')).toLowerCase().includes(q))
  }, [list, query])

  function readFileAsDataURL(file, cb) {
    const reader = new FileReader()
    reader.onload = (e) => cb(e.target.result)
    reader.readAsDataURL(file)
  }

  function handlePhotoChange(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return setPhoto('')
    readFileAsDataURL(f, data => setPhoto(data))
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    const cls = classes.find(c => c.id === classId)
    const newItem = {
      id: 'stu' + Date.now(),
      name: name.trim(),
      regNo: regNo.trim(),
      classId: classId || '',
      className: cls ? cls.name : '',
      photo: photo || '',
      dateAdmission: dateAdmission || '',
      dob: dob || '',
      mobile: mobile || '',
      father: { name: fatherName, phone: fatherPhone, profession: fatherProfession },
      mother: { name: motherName, phone: motherPhone, profession: motherProfession },
      siblings: siblings.slice(),
      active: true
    }
    setList(prev => { const updated = [newItem, ...prev]; saveToStorage(updated); return updated })
    // reset
    setName(''); setRegNo(''); setClassId(''); setPhoto(''); setDateAdmission(''); setDob(''); setMobile('')
    setFatherName(''); setFatherPhone(''); setFatherProfession(''); setMotherName(''); setMotherPhone(''); setMotherProfession('')
    setSiblings([]); setShowForm(false)
  }

  function startEdit(s) {
    setEditingId(s.id)
    setEditValues({ ...s })
  }

  function cancelEdit() { setEditingId(null); setEditValues(null) }

  function saveEdit(e) {
    e.preventDefault()
    if (!editingId || !editValues) return
    setList(prev => {
      const updated = prev.map(it => it.id === editingId ? { ...it, ...editValues, siblings: editValues.siblings || [] } : it)
      saveToStorage(updated)
      return updated
    })
    setEditingId(null); setEditValues(null)
  }

  function toggleActive(id) {
    setList(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, active: !i.active } : i)
      saveToStorage(updated)
      return updated
    })
  }

  // sibling helper: show matching existing students (exclude current editing id and already selected)
  const matchingSiblings = useMemo(() => {
    const q = sibSearch.trim().toLowerCase()
    if (!q) return []
    return list.filter(s => s.id !== editingId && s.name.toLowerCase().includes(q) && !(editingId ? (editValues && (editValues.siblings||[]).includes(s.id)) : siblings.includes(s.id)))
  }, [sibSearch, list, siblings, editingId, editValues])

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Students</h2>
        <div className="flex items-center gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search students..." className="px-3 py-2 border rounded" />
          <IconButton title={showForm ? 'Cancel' : 'Add Student'} onClick={() => setShowForm(s => !s)} className="p-2 bg-indigo-600 text-white rounded">
            {showForm ? '×' : '+'}
          </IconButton>
        </div>
      </div>

      {showForm && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="p-2 border rounded" />
              <input value={regNo} onChange={e=>setRegNo(e.target.value)} placeholder="Reg. no" className="p-2 border rounded" />
              <select value={classId} onChange={e=>setClassId(e.target.value)} className="p-2 border rounded">
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="p-2" />
              <input value={dateAdmission} onChange={e=>setDateAdmission(e.target.value)} type="date" className="p-2 border rounded" />
              <input value={dob} onChange={e=>setDob(e.target.value)} type="date" className="p-2 border rounded" />
              <input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile" className="p-2 border rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="font-medium">Father</div>
                <input value={fatherName} onChange={e=>setFatherName(e.target.value)} placeholder="Name" className="p-2 border rounded mt-1 w-full" />
                <input value={fatherPhone} onChange={e=>setFatherPhone(e.target.value)} placeholder="Phone" className="p-2 border rounded mt-1 w-full" />
                <input value={fatherProfession} onChange={e=>setFatherProfession(e.target.value)} placeholder="Profession" className="p-2 border rounded mt-1 w-full" />
              </div>
              <div>
                <div className="font-medium">Mother</div>
                <input value={motherName} onChange={e=>setMotherName(e.target.value)} placeholder="Name" className="p-2 border rounded mt-1 w-full" />
                <input value={motherPhone} onChange={e=>setMotherPhone(e.target.value)} placeholder="Phone" className="p-2 border rounded mt-1 w-full" />
                <input value={motherProfession} onChange={e=>setMotherProfession(e.target.value)} placeholder="Profession" className="p-2 border rounded mt-1 w-full" />
              </div>
            </div>

            <div>
              <div className="font-medium">Siblings</div>
              <div className="flex gap-2 mt-2">
                <input value={sibSearch} onChange={e=>setSibSearch(e.target.value)} placeholder="Search existing students to add" className="p-2 border rounded flex-1" />
                <div className="p-2 border rounded bg-white max-h-36 overflow-auto w-64">
                  {matchingSiblings.map(s => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span>{s.name} ({s.regNo||'—'})</span>
                      <button type="button" onClick={() => setSiblings(prev => [...prev, s.id])} className="text-indigo-600">Add</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {siblings.map(id => {
                  const s = list.find(x=>x.id===id)
                  return <div key={id} className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-2">{s ? s.name : id} <button type="button" onClick={() => setSiblings(prev => prev.filter(x=>x!==id))} className="text-red-500">×</button></div>
                })}
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
        {filtered.map(s => (
          <div key={s.id} className={`bg-white shadow rounded-lg p-4 ${s.active === false ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {s.photo ? <img src={s.photo} alt="photo" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No photo</div>}
              </div>
              <div className="flex-1">
                <div className="font-medium">{s.name} {s.active === false && <span className="text-xs text-red-500 ml-2">(Deactivated)</span>}</div>
                <div className="text-sm text-gray-500">Reg: {s.regNo||'—'} · Class: {s.className||'—'}</div>
                <div className="text-sm">Mobile: {s.mobile||'—'}</div>
                <div className="text-sm mt-1">Parents: Father - {s.father?.name||'—'} ({s.father?.phone||'—'}); Mother - {s.mother?.name||'—'}</div>
                <div className="text-sm mt-1">Siblings: {(s.siblings||[]).map(id => (list.find(x=>x.id===id)||{}).name).filter(Boolean).join(', ') || '—'}</div>
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
                {editingId === s.id && editValues && (
                  <div className="w-full">
                    <form onSubmit={saveEdit} className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input value={editValues.name||''} onChange={e=>setEditValues({...editValues, name: e.target.value})} className="p-2 border rounded" />
                        <input value={editValues.regNo||''} onChange={e=>setEditValues({...editValues, regNo: e.target.value})} className="p-2 border rounded" />
                        <select value={editValues.classId||''} onChange={e=>setEditValues({...editValues, classId: e.target.value, className: (classes.find(c=>c.id===e.target.value)||{}).name || ''})} className="p-2 border rounded">
                          <option value="">Select class</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files&&e.target.files[0]; if(f){ const r=new FileReader(); r.onload=ev=>setEditValues(prev=>({...prev, photo: ev.target.result})); r.readAsDataURL(f) } }} className="p-2" />
                        <input value={editValues.dateAdmission||''} onChange={e=>setEditValues({...editValues, dateAdmission: e.target.value})} type="date" className="p-2 border rounded" />
                        <input value={editValues.dob||''} onChange={e=>setEditValues({...editValues, dob: e.target.value})} type="date" className="p-2 border rounded" />
                        <input value={editValues.mobile||''} onChange={e=>setEditValues({...editValues, mobile: e.target.value})} className="p-2 border rounded" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input value={editValues.father?.name||''} onChange={e=>setEditValues({...editValues, father: {...(editValues.father||{}), name: e.target.value}})} placeholder="Father name" className="p-2 border rounded" />
                        <input value={editValues.father?.phone||''} onChange={e=>setEditValues({...editValues, father: {...(editValues.father||{}), phone: e.target.value}})} placeholder="Father phone" className="p-2 border rounded" />
                        <input value={editValues.father?.profession||''} onChange={e=>setEditValues({...editValues, father: {...(editValues.father||{}), profession: e.target.value}})} placeholder="Father profession" className="p-2 border rounded" />
                        <input value={editValues.mother?.name||''} onChange={e=>setEditValues({...editValues, mother: {...(editValues.mother||{}), name: e.target.value}})} placeholder="Mother name" className="p-2 border rounded" />
                        <input value={editValues.mother?.phone||''} onChange={e=>setEditValues({...editValues, mother: {...(editValues.mother||{}), phone: e.target.value}})} placeholder="Mother phone" className="p-2 border rounded" />
                        <input value={editValues.mother?.profession||''} onChange={e=>setEditValues({...editValues, mother: {...(editValues.mother||{}), profession: e.target.value}})} placeholder="Mother profession" className="p-2 border rounded" />
                      </div>
                      <div>
                        <div className="font-medium">Siblings</div>
                        <div className="flex gap-2 mt-2">
                          <input placeholder="Search existing students to add" value={sibSearch} onChange={e=>setSibSearch(e.target.value)} className="p-2 border rounded flex-1" />
                          <div className="p-2 border rounded bg-white max-h-36 overflow-auto w-64">
                            {matchingSiblings.map(s => (
                              <div key={s.id} className="flex items-center justify-between text-sm">
                                <span>{s.name} ({s.regNo||'—'})</span>
                                <button type="button" onClick={() => setEditValues(prev => ({...prev, siblings: [...(prev.siblings||[]), s.id]}))} className="text-indigo-600">Add</button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(editValues.siblings||[]).map(id => {
                            const s2 = list.find(x=>x.id===id)
                            return <div key={id} className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-2">{s2 ? s2.name : id} <button type="button" onClick={() => setEditValues(prev => ({...prev, siblings: (prev.siblings||[]).filter(x=>x!==id)}))} className="text-red-500">×</button></div>
                          })}
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
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-gray-500">No students found.</div>
        )}
      </div>
    </>
  )
}
