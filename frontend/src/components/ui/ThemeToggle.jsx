import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="btn-ghost h-10 w-10 rounded-xl p-0 text-lg"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
