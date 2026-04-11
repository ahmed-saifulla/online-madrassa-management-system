
import React, { useState, useEffect, useMemo } from 'react';
import IconButton from '../../components/IconButton';
import CrudForm from '../../components/CrudForm';

import { DepartmentsAPI, TeachersAPI } from '../../lib/api';

export default function Divisions() {
  const [list, setList] = useState([])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [head, setHead] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editHead, setEditHead] = useState('')
  const [teachers, setTeachers] = useState([])

  useEffect(() => {
    DepartmentsAPI.list()
      .then(res => setList(Array.isArray(res.data) ? res.data : []))
      .catch(() => setList([]));
    TeachersAPI.list()
      .then(res => {
        // Some APIs return { data: [...] }, some return [...]
        let arr = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        // Debug: log teacher objects
        if (arr.length && typeof window !== 'undefined') console.log('Teachers:', arr);
        setTeachers(arr);
      })
      .catch(() => setTeachers([]));
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(d => (d.name + ' ' + (d.head_teacher_id || '')).toLowerCase().includes(q));
  }, [list, query]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !description.trim()) return;
    try {
      const res = await DepartmentsAPI.create({
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        head_teacher_id: head.trim() || null
      });
      const newDept = res.data || res;
      setList(prev => [newDept, ...prev]);
      setName(''); setCode(''); setDescription(''); setHead(''); setShowForm(false);
    } catch (err) {
      // handle error (show toast, etc)
    }
  }

  async function handleToggleActive(id) {
    setList(prev => prev.map(x => x.id === id ? { ...x, is_active: !x.is_active } : x));
    try {
      const dept = list.find(x => x.id === id);
      await DepartmentsAPI.update(id, { is_active: !dept.is_active });
    } catch (err) {
      // handle error
    }
  }

  function startEdit(d) {
    setEditingId(d.id); setEditName(d.name); setEditHead(d.head_teacher_id || '');
  }

  function cancelEdit() { setEditingId(null) }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editingId) return;
    try {
      await DepartmentsAPI.update(editingId, { name: editName.trim() });
      if (editHead) {
        await DepartmentsAPI.setHead(editingId, editHead);
      } else {
        await DepartmentsAPI.removeHead(editingId);
      }
      // Refresh list
      const res = await DepartmentsAPI.list();
      setList(Array.isArray(res.data) ? res.data : []);
      setEditingId(null);
    } catch (err) {
      // handle error
    }
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Division name" className="p-2 border rounded" />
              <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Code" className="p-2 border rounded" />
              <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="p-2 border rounded" />
              <select value={head} onChange={e=>setHead(e.target.value)} className="p-2 border rounded">
                <option value="">Select head teacher (optional)</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{(t.first_name || '') + (t.last_name ? ' ' + t.last_name : '') || t.full_name || t.name || t.email || t.id}</option>
                ))}
              </select>
            </div>
          </CrudForm>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map(d => (
          <div key={d.id} className={`bg-white shadow rounded-lg p-4 flex items-center justify-between ${d.active===false ? 'opacity-60' : ''}`}>
            <div>
              <div className="font-medium">{d.name} {d.active===false && <span className="text-xs text-red-500 ml-2">(Deactivated)</span>}</div>
              <div className="text-sm text-gray-500">Head: {d.head_teacher?.first_name} {d.head_teacher?.last_name}</div>
            </div>
            <div className="flex flex-col gap-2">
              {editingId === d.id ? (
                <div className="w-full">
                  <CrudForm onSubmit={saveEdit} onCancel={cancelEdit} saveTitle="Save" cancelTitle="Cancel">
                    <input value={editName} onChange={e=>setEditName(e.target.value)} className="p-2 border rounded" />
                    <select value={editHead} onChange={e=>setEditHead(e.target.value)} className="p-2 border rounded">
                      <option value="">Select head teacher (optional)</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{(t.first_name || '') + (t.last_name ? ' ' + t.last_name : '') || t.full_name || t.name || t.email || t.id}</option>
                      ))}
                    </select>
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
