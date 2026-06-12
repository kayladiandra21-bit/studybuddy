const STYLES = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
};

export default function Badge({ variant = 'brand', children }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STYLES[variant] || STYLES.brand}`}>
      {children}
    </span>
  );
}
