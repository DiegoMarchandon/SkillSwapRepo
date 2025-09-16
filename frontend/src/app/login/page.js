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
    try {
      // SIN csrf-cookie, es por token
      const res = await api.post('/api/login', { email, password });
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      login(user);
      router.push('/');
    } catch (err) {
      if (err.response?.status === 422) setError(err.response.data.errors);
      else if (err.response?.status === 401) setError('Credenciales inválidas');
      else setError(err.message);
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
