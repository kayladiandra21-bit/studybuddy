export default function Spinner({ className = '' }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
