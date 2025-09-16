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

      // 👇 Ahora consultamos al backend directamente
      api.get('/api/user', { withCredentials: true })
        .then(res => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    
  }, []);

  const login = async(userData) => {
    // userData viene del backend (al registrar o loguear)
    setUser(userData);
    router.push('/');
  };

  const logout = async () => {
    try {
      // 🔑 Obtener CSRF cookie antes de hacer logout
    await api.get('/sanctum/csrf-cookie');
    
        await api.post('/api/logout',{},{withCredentials: true});
        setUser(null);
        router.push('/');
    }catch(error){
        if(error.response?.status !== 401){
          console.error("Error al cerrar sesión: ",error);
        }
        // lo diferenciamos del 401 porque en este caso implica que la sesión ya fue destruida. Por lo que lo ingoraríamos.
    }finally{
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
