'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/axios';

const AuthContext = createContext({ user:null, loading:true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!t) { setLoading(false); return; }        // ← no pegamos sin token
        const { data } = await api.get('/user');      // ← OJO: sin /api
        setUser(data);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = (userData, { redirect = false } = {}) => {
    setUser(userData);
    if (redirect) router.push('/');
  };

  const logout = async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
