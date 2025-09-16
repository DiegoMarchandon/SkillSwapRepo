'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '../../components/forms/RegisterForm';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // SIN csrf-cookie, es por token
      const res = await api.post('/api/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
      });

      const { user, token } = res.data;
      localStorage.setItem('token', token);
      login(user);              // actualiza contexto/UI
      router.push('/');
    } catch (err) {
      if (err.response?.status === 422) {
        const apiErrors = err.response.data.errors || {};
        const formatted = {};
        for (const k in apiErrors) formatted[k] = apiErrors[k][0];
        setError(formatted);
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <RegisterForm
        name={name} setName={setName}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        passwordConfirm={passwordConfirm} setPasswordConfirm={setPasswordConfirm}
        error={error} setError={setError}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
