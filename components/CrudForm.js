import IconButton from './IconButton'

export default function CrudForm({ onSubmit, onCancel, children, saveTitle = 'Save', cancelTitle = 'Cancel' }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {children}
      <div className="flex gap-2 mt-2">
        <IconButton title={saveTitle} type="submit" className="px-3 py-1 bg-green-600 text-white rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </IconButton>
        <IconButton title={cancelTitle} onClick={onCancel} className="px-3 py-1 bg-gray-200 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
      </div>
    </form>
  )
}
