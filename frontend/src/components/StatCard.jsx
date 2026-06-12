// Dashboard stat widget
export default function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-2xl dark:bg-brand-500/10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}
