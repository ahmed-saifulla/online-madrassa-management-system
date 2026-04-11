import { useState, useEffect } from 'react';
import IconButton from '../../../components/IconButton';
import { AcademicYearsAPI, formatDateForAPI } from '../../../lib/api';

export default function AcademicYearsPage() {
  const [years, setYears] = useState([]);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    AcademicYearsAPI.list()
      .then(res => setYears(Array.isArray(res.data) ? res.data : []))
      .catch(() => setYears([]));
  }, []);

  const filteredYears = years.filter(y => y.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!name.trim()) {
      setError('Name is required.');
      setLoading(false);
      return;
    }
    if (!startDate) {
      setError('Start date is required.');
      setLoading(false);
      return;
    }
    if (!endDate) {
      setError('End date is required.');
      setLoading(false);
      return;
    }
    try {
      const res = await AcademicYearsAPI.create({
        name: name.trim(),
        start_date: formatDateForAPI(startDate),
        end_date: formatDateForAPI(endDate)
      });
      setYears(prev => [res.data, ...prev]);
      setName('');
      setStartDate('');
      setEndDate('');
      setShowForm(false);
      setNotice('Academic year added');
      setTimeout(()=>setNotice(''), 1800);
    } catch (err) {
      setError('Failed to add: ' + err.message);
    }
    setLoading(false);
  }

  function startEdit(y) {
    setEditingId(y.id);
    setEditName(y.name);
    setEditStartDate(y.start_date ? y.start_date.substring(0, 10) : '');
    setEditEndDate(y.end_date ? y.end_date.substring(0, 10) : '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditStartDate('');
    setEditEndDate('');
  }

  async function saveEdit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!editName.trim()) {
      setError('Name is required.');
      setLoading(false);
      return;
    }
    if (!editStartDate) {
      setError('Start date is required.');
      setLoading(false);
      return;
    }
    if (!editEndDate) {
      setError('End date is required.');
      setLoading(false);
      return;
    }
    try {
      const res = await AcademicYearsAPI.update(editingId, {
        name: editName.trim(),
        start_date: formatDateForAPI(editStartDate),
        end_date: formatDateForAPI(editEndDate)
      });
      setYears(prev => prev.map(y => y.id === editingId ? res.data : y));
      cancelEdit();
      setNotice('Academic year updated');
      setTimeout(()=>setNotice(''), 1800);
    } catch (err) {
      setError('Failed to update: ' + err.message);
    }
    setLoading(false);
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    setLoading(true);
    setError('');
    try {
      await AcademicYearsAPI.delete(id);
      setYears(prev => prev.filter(y => y.id !== id));
    } catch (err) {
      setError('Failed to delete: ' + err.message);
    }
    setLoading(false);
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
          {/* <IconButton title="Migrate data" onClick={()=>setShowMigrate(true)} className="px-3 py-2 bg-green-600 text-white rounded">Migrate</IconButton> */}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e=>setStartDate(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e=>setEndDate(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
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
                {editingId === y.id ? (
                  <form onSubmit={saveEdit} className="flex-1 flex gap-2 items-end">
                    <input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full px-3 py-2 border rounded" />
                    <input type="date" value={editStartDate} onChange={e=>setEditStartDate(e.target.value)} className="px-3 py-2 border rounded" required />
                    <input type="date" value={editEndDate} onChange={e=>setEditEndDate(e.target.value)} className="px-3 py-2 border rounded" required />
                    <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                    <button type="button" onClick={cancelEdit} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{y.name}</div>
                      {/* <div className="text-xs text-gray-500">ID: {y.id}</div> */}
                      <div className="text-xs text-gray-500">{y.start_date ? `Start: ${y.start_date.substring(0,10)}` : ''}</div>
                      <div className="text-xs text-gray-500">{y.end_date ? `End: ${y.end_date.substring(0,10)}` : ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconButton title="Edit" onClick={()=>startEdit(y)} className="px-3 py-1 bg-blue-500 text-white rounded">Edit</IconButton>
                      <IconButton title="Delete" onClick={()=>handleDelete(y.id, y.name)} className="px-3 py-1 bg-red-500 text-white rounded">Del</IconButton>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="text-gray-500">Use the year selector (top right) to choose an active academic year. Manage years here by adding, deleting or migrating data.</div>
      </div>

      {/* {showMigrate && (
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
      )} */}
    </div>
  )
}
