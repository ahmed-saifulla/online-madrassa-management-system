import { useState, useMemo, useEffect } from 'react'
import { teachers } from '../../data/teachers'
import IconButton from '../../components/IconButton'
import CrudForm from '../../components/CrudForm'
import { TeachersAPI } from '../../lib/api';


export default function Teachers() {
  const [list, setList] = useState([])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [qualification, setQualification] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [joiningDate, setJoiningDate] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editQualification, setEditQualification] = useState('')
  const [editSpecialization, setEditSpecialization] = useState('')
  const [editJoiningDate, setEditJoiningDate] = useState('')
  const [editEmployeeId, setEditEmployeeId] = useState('')
  const [editGender, setEditGender] = useState('Male')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    console.log('list ', list);
    
    return list.filter(t => `${t.first_name} ${t.last_name}`.toLowerCase().includes(q))
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
    if (!firstName.trim() || !lastName.trim()) return
    const newTeacher = {
      // keep a temporary id for client-side list; Supabase may overwrite with its id
      id: 't' + Date.now(),
      employee_id: employeeId.trim() || `EMP${Date.now()}`,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      gender: gender || 'MALE',
      phone: phone.trim() || '',
      qualification: qualification.trim() || '',
      specialization: specialization.trim() || '',
      joining_date: joiningDate || '',
      is_active: true
    }

    try {
      const data = await TeachersAPI.create(newTeacher);
      setList(prev => [data, ...prev]);
      finishAdd();
      return;
    } catch (err) {
      console.error('API insert failed, falling back to localStorage', err);
      setList(prev => {
        const updated = [newTeacher, ...prev];
        try { localStorage.setItem('madrassa_teachers', JSON.stringify(updated)); } catch (e) {}
        try { teachers.unshift(newTeacher); } catch (e) {}
        return updated;
      });
      finishAdd();
    }
  }

  function finishAdd() {
    setFirstName('')
    setLastName('')
    setAvatar('')
    setEmail('')
    setPhone('')
    setQualification('')
    setSpecialization('')
    setJoiningDate('')
    setEmployeeId('')
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
    const newActive = !(cur.is_active === false)

    try {
      const data = await TeachersAPI.setActive(id, newActive);
      setList(prev => prev.map(t => t.id === id ? { ...t, is_active: data.is_active } : t));
    } catch (err) {
      console.error('API update failed, falling back to localStorage', err);
      setList(prev => {
        const updated = prev.map(t => t.id === id ? { ...t, is_active: newActive } : t);
        saveToStorage(updated);
        try {
          const idx = teachers.findIndex(x => x.id === id);
          if (idx >= 0) teachers[idx].is_active = updated.find(x => x.id === id).is_active;
        } catch (e) {}
        return updated;
      });
    }
  }

  function startEdit(t) {
    setEditingId(t.id)
    setEditFirstName(t.first_name)
    setEditLastName(t.last_name)
    setEditAvatar(t.avatar || '')
    setEditEmail(t.email || '')
    setEditPhone(t.phone || '')
    setEditQualification(t.qualification || '')
    setEditSpecialization(t.specialization || '')
    setEditJoiningDate(t.joining_date || '')
    setEditEmployeeId(t.employee_id || '')
    setEditGender(t.gender || 'Male')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function saveEdit(e) {
    e.preventDefault()
    if (!editingId) return

    const updates = {
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      avatar: editAvatar.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      qualification: editQualification.trim(),
      specialization: editSpecialization.trim(),
      joining_date: editJoiningDate,
      employee_id: editEmployeeId.trim(),
      gender: editGender
    }

    (async () => {
      try {
        const data = await TeachersAPI.update(editingId, updates);
        setList(prev => prev.map(t => t.id === editingId ? { ...t, ...data } : t));
      } catch (err) {
        console.error('API update failed, falling back to localStorage', err);
        setList(prev => {
          const updated = prev.map(t => t.id !== editingId ? t : { ...t, ...updates });
          saveToStorage(updated);
          try {
            updated.forEach(u => {
              const idx = teachers.findIndex(x => x.id === u.id);
              if (idx >= 0) teachers[idx] = { ...teachers[idx], ...u };
            });
          } catch (e) {}
          return updated;
        });
      }
      setEditingId(null);
    })();
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const load = async () => {
      try {
        const response = await TeachersAPI.list();
        setList(response.data);
        return;
      } catch (err) {
        console.error('API fetch failed, falling back to localStorage', err);
      }

      try {
        const raw = localStorage.getItem('madrassa_teachers');
        if (raw) {
          setList(JSON.parse(raw));
          return;
        }
      } catch (e) {}

      // fallback to bundled data
      setList(teachers.slice());
    };

    load();
  }, []);

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
                <label className="text-sm font-medium mb-1 block">First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Employee ID</label>
                <input value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="Employee ID" className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className="p-2 border rounded w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Qualification</label>
                <input value={qualification} onChange={e => setQualification(e.target.value)} placeholder="Qualification" className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Specialization</label>
                <input value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="Specialization" className="p-2 border rounded w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Joining Date</label>
                <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className="p-2 border rounded w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="p-2 border rounded w-full">
                  <option>MALE</option>
                  <option>FEMALE</option>
                  <option>OTHER</option>
                </select>
              </div>
            </div>
          </CrudForm>
        </div>
      )}

      <div className="mt-4 grid gap-4 grid-cols-1">
        {filtered.map(t => (
          <div key={t.id} className={`bg-white shadow rounded-lg p-4 flex items-center space-x-4 ${t.is_active === false ? 'opacity-60' : ''}`}>
            <div className="flex-1">
              {editingId === t.id ? (
                <div className="w-full">
                  <CrudForm onSubmit={saveEdit} onCancel={cancelEdit} saveTitle="Save" cancelTitle="Cancel">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-sm font-medium mb-1 block">First Name</label>
                          <input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Last Name</label>
                          <input value={editLastName} onChange={e => setEditLastName(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Employee ID</label>
                          <input value={editEmployeeId} onChange={e => setEditEmployeeId(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email</label>
                          <input value={editEmail} onChange={e => setEditEmail(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Phone</label>
                          <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Qualification</label>
                          <input value={editQualification} onChange={e => setEditQualification(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Specialization</label>
                          <input value={editSpecialization} onChange={e => setEditSpecialization(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Joining Date</label>
                          <input type="date" value={editJoiningDate} onChange={e => setEditJoiningDate(e.target.value)} className="p-2 border rounded w-full" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Gender</label>
                          <select value={editGender} onChange={e => setEditGender(e.target.value)} className="p-2 border rounded w-full">
                            <option>MALE</option>
                            <option>FEMALE</option>
                            <option>OTHER</option>
                          </select>
                        </div>
                      </div>
                  </CrudForm>
                </div>
              ) : (
                <>
                  <div className="font-medium">{t.first_name} {t.last_name} {t.is_active === false && <span className="text-xs text-red-500 ml-2">(Deactivated)</span>}</div>
                  <div className="text-sm text-gray-500">{t.email && <span className="ml-2 text-sm text-gray-400">• {t.email}</span>}</div>
                  <div className="text-xs text-gray-400 mt-1">{t.gender} • {t.phone} • Joined {t.joining_date || '—'} • Employee ID {t.employee_id}</div>
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
                    <button type="button" onClick={() => handleToggleActive(t.id)} title={t.is_active === false ? 'Activate' : 'Deactivate'} aria-label={t.is_active === false ? 'Activate' : 'Deactivate'} className={`px-3 py-1 rounded flex items-center justify-center ${t.is_active === false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
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
                    <span className="pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">{t.is_active === false ? 'Activate' : 'Deactivate'}</span>
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
