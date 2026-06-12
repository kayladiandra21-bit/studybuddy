export default function EmptyState({ icon = '📭', title, hint }) {
  return (
    <div className="grid place-items-center py-14 text-center">
      <div className="text-4xl">{icon}</div>
      <p className="mt-3 font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
