// Temporary page used while real pages are built in Steps 6-7
export default function Placeholder({ title }) {
  return (
    <div className="card grid place-items-center py-20 text-center">
      <div>
        <div className="text-4xl">🚧</div>
        <h1 className="mt-3 text-xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          This page is coming in the next step. Login & navigation already work!
        </p>
      </div>
    </div>
  );
}
