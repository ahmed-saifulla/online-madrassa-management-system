import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function YearSelector() {
  const [years, setYears] = useState([])
  const [selected, setSelected] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('madrassa_academic_years')
      const arr = raw ? JSON.parse(raw) : []
      setYears(arr)
      const active = localStorage.getItem('madrassa_active_year')
      if (active) setSelected(active)
      else if (arr.length) {
        setSelected(arr[0].id)
        localStorage.setItem('madrassa_active_year', arr[0].id)
      }
    } catch (e) { setYears([]) }
  }, [])

  function change(v) {
    setSelected(v)
    try { localStorage.setItem('madrassa_active_year', v) } catch (e) {}
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('madrassa_year_changed'))
  }

  return (
    <div className="flex items-center gap-2">
      <select value={selected} onChange={e=>change(e.target.value)} className="p-2 border rounded bg-white text-sm">
        {years.length === 0 ? <option value="">No years</option> : years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
      </select>
    </div>
  )
}
