import { useState } from 'react'

export default function MigrateModal({ years = [], onClose = ()=>{}, onMigrate = ()=>{} }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!from || !to || from === to) return
    onMigrate(from, to)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold">Migrate data between academic years</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-gray-700">From</label>
            <select value={from} onChange={e=>setFrom(e.target.value)} className="mt-1 block w-full p-2 border rounded">
              <option value="">Select source year</option>
              {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-700">To</label>
            <select value={to} onChange={e=>setTo(e.target.value)} className="mt-1 block w-full p-2 border rounded">
              <option value="">Select target year</option>
              {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Migrate</button>
          </div>
        </form>
      </div>
    </div>
  )
}
