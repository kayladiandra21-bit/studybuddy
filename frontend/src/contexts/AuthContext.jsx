// contexts/AuthContext.jsx
// Global auth state. "Remember me" decides WHERE the token lives:
//   - remembered  → localStorage   (survives closing the browser)
//   - not         → sessionStorage (cleared when the tab closes)
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true); // restoring session on first load

  // On first load: if a token exists, ask the API who we are
  useEffect(() => {
    const token =
      localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token');
    if (!token) {
      setBooting(false);
      return;
    }
    authService
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('sb_token');
        sessionStorage.removeItem('sb_token');
      })
      .finally(() => setBooting(false));
  }, []);

  function storeToken(token, rememberMe) {
    if (rememberMe) localStorage.setItem('sb_token', token);
    else sessionStorage.setItem('sb_token', token);
  }

  async function login(email, password, rememberMe) {
    const res = await authService.login({ email, password, rememberMe });
    storeToken(res.data.token, rememberMe);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(data) {
    const res = await authService.register(data);
    storeToken(res.data.token, false);
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('sb_token');
    sessionStorage.removeItem('sb_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, booting, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
