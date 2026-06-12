// Inline alert for form errors / success messages
export default function Alert({ type = 'error', children }) {
  if (!children) return null;
  const styles =
    type === 'error'
      ? 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20'
      : 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20';
  return (
    <div className={`rounded-xl px-3.5 py-2.5 text-sm ring-1 ${styles}`} role="alert">
      {children}
    </div>
  );
}
