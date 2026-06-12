// Reusable modal with backdrop. Closes on backdrop click or ✕.
export default function Modal({ open, title, onClose, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`card relative max-h-[90vh] w-full overflow-y-auto shadow-2xl animate-fade-up ${
          wide ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="btn-ghost h-9 w-9 p-0" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
