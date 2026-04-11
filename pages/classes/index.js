import { useState, useEffect } from 'react';
import { DepartmentsAPI, StandardsAPI } from '../../lib/api';
export default function Classes() {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOrderIndex, setEditOrderIndex] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    DepartmentsAPI.list()
      .then(res => setDepartments(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDepartments([]));
    StandardsAPI.list()
      .then(res => setList(Array.isArray(res.data) ? res.data : []))
      .catch(() => setList([]));
  }, []);

  async function handleAddClass(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!name.trim() || !departmentId || !orderIndex.trim()) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    const payload = {
      name: name.trim(),
      department_id: departmentId,
      order_index: Number(orderIndex),
      description: description.trim(),
    };
    try {
      const data = await StandardsAPI.create(payload);
      setList(prev => [data.data, ...prev]);
      setName(''); setDescription(''); setOrderIndex(''); setDepartmentId(''); setShowForm(false);
    } catch (err) {
      setError('Failed to add class: ' + err.message);
    }
    setLoading(false);
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDescription(c.description || '');
    setEditOrderIndex(c.order_index ? String(c.order_index) : '');
    setEditDepartmentId(c.department_id || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
    setEditOrderIndex('');
    setEditDepartmentId('');
  }

  async function saveEdit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!editName.trim() || !editDepartmentId || !editOrderIndex.trim()) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    const payload = {
      name: editName.trim(),
      department_id: editDepartmentId,
      order_index: Number(editOrderIndex),
      description: editDescription.trim(),
    };
    try {
      const data = await StandardsAPI.update(editingId, payload);
      setList(prev => prev.map(c => c.id === editingId ? data.data : c));
      cancelEdit();
    } catch (err) {
      setError('Failed to update class: ' + err.message);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this class?')) return;
    setLoading(true);
    setError('');
    try {
      await StandardsAPI.delete(id);
      setList(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete class: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Classes</h2>
      {error && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded border border-red-300">{error}</div>}
      <button onClick={() => setShowForm(f => !f)} className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded">{showForm ? 'Cancel' : 'Add Class'}</button>
      {showForm && (
        <form onSubmit={handleAddClass} className="space-y-4 bg-white rounded shadow p-6 mb-6">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Class name" className="p-2 border rounded w-full" />
          <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="p-2 border rounded w-full" />
          <input value={orderIndex} onChange={e=>setOrderIndex(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Order index (number)" className="p-2 border rounded w-full" />
          <select value={departmentId} onChange={e=>setDepartmentId(e.target.value)} className="p-2 border rounded w-full">
            <option value="">Select department (division)</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded w-full" disabled={loading}>{loading ? 'Adding...' : 'Add Class'}</button>
        </form>
      )}
      <div className="grid gap-4">
        {list.map(c => (
          <div key={c.id} className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
            {editingId === c.id ? (
              <form onSubmit={saveEdit} className="flex-1 flex flex-col gap-2">
                <input value={editName} onChange={e=>setEditName(e.target.value)} className="p-2 border rounded" />
                <input value={editDescription} onChange={e=>setEditDescription(e.target.value)} className="p-2 border rounded" />
                <input value={editOrderIndex} onChange={e=>setEditOrderIndex(e.target.value.replace(/[^0-9]/g, ''))} className="p-2 border rounded" />
                <select value={editDepartmentId} onChange={e=>setEditDepartmentId(e.target.value)} className="p-2 border rounded">
                  <option value="">Select department (division)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button type="button" onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <div className="font-medium text-lg">{c.name}</div>
                  <div className="text-sm text-gray-500">Description: {c.description || '—'}</div>
                  <div className="text-sm text-gray-500">Order: {c.order_index || '—'} · Department: {departments.find(d => d.id === c.department_id)?.name || '—'}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => startEdit(c)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
        {list.length === 0 && <div className="text-gray-500">No classes found.</div>}
      </div>
    </div>
  );
}