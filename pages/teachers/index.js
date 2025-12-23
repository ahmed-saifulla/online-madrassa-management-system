import { teachers } from '../../data/teachers'

export default function Teachers() {
  return (
    <>
      <h2 className="text-xl font-semibold">Teachers</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {teachers.map(t => (
          <div key={t.id} className="bg-white shadow rounded-lg p-4 flex items-center space-x-4">
            <img src={t.avatar} alt={t.name} className="h-14 w-14 rounded-full object-cover" />
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-gray-500">{t.subject}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
