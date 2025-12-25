export default function IconButton({ title, onClick, children, className = 'px-3 py-1 rounded', type = 'button' }) {
  return (
    <span className="relative inline-block group">
      <button type={type} onClick={onClick} title={title} aria-label={title} className={`${className} flex items-center justify-center`}>
        {children}
      </button>
      <span className="pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">{title}</span>
    </span>
  )
}
