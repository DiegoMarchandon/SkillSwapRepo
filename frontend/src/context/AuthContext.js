'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token }); // más adelante podés hacer fetch a /api/user para traer datos
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser({ token });
    router.push('/');
  };

  /* const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  }; */

  const logout = async () => {
    try {
        await axios.post(
            'http://127.0.0.1:8000/api/logout',
            {},
            { withCredentials: true }
        );
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
