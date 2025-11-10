'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext'; // ajustá si tu path es distinto
import LoginForm from '../../../components/forms/LoginForm';
import api from '../../../utils/axios';

export default function LoginClient({ next = '/perfil' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/login', { email, password });
      const token =
        res.data?.token ?? res.data?.access_token ?? res.data?.data?.token;
      const user = res.data?.user ?? res.data?.data?.user ?? null;

      if (!token) throw new Error('No se recibió el token.');
      localStorage.setItem('token', token);
      login(user);                           // actualizá tu contexto
      router.replace(`${next}?ok=login`);    // redirigí a donde estabas
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#0b0c10] text-[#e6f3ff] px-4">
      <div className="w-full max-w-md pixel-shadow bg-[#0d1220] p-6">
        <LoginForm
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          error={error}
          handleSubmit={handleSubmit}
          next={next}
        />
      </div>
    </div>
  );
}
