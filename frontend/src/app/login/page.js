'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/forms/LoginForm';
import api from '../../utils/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // SIN /api delante (axios.baseURL ya lo tiene)
      const res = await api.post('/login', { email, password });
      const token = res.data?.token ?? res.data?.access_token ?? res.data?.data?.token;
      const user  = res.data?.user ?? res.data?.data?.user ?? null;

      if (!token) throw new Error('No se recibió el token.');
      localStorage.setItem('token', token);
      login(user, { redirect: true }); // setea usuario y redirige al home
    } catch (err) {
      setError(err); // el LoginForm lo convierte a array; no crashea
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <LoginForm
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        error={error}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
