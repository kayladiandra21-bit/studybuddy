import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg font-black text-white shadow-sm">
        S
      </span>
      <span className="text-lg font-bold tracking-tight">
        Study<span className="text-brand-600 dark:text-brand-400">Buddy</span>
      </span>
    </Link>
  );
}
