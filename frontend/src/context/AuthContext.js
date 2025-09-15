'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 👇 paso 3: pedimos datos del usuario real al backend
      api.get('/api/user')
        .then(res => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    // después de guardar el token pedimos info real al backend
    api.get('/api/user').then(res => setUser(res.data));
    router.push('/');
  };

  const logout = async () => {
    try {
        await api.post(
            '/api/logout',{});
        localStorage.removeItem('token');
        setUser(null);
        router.push('/');
    }catch(error){
        console.error("Error al cerrar sesión: ",error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
