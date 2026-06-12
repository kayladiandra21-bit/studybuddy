// contexts/ThemeContext.jsx
// Dark mode via Tailwind's `class` strategy: we toggle .dark on <html>.
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('sb_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sb_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d), setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
