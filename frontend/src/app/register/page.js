'use client';
import { createAvatar } from "@dicebear/core";
import * as botttsNeutral from "@dicebear/bottts-neutral";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '../../components/forms/RegisterForm';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(null); // puede ser string u objeto {campo: msg}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1️⃣ Generar avatar SVG
    const avatar = createAvatar(botttsNeutral, { seed: name });
    const svg = avatar.toString();

    // 2️⃣ Convertir a base64 para enviarlo
    const avatarBase64 = Buffer.from(svg).toString("base64");

    try {
      // TOKEN-BASED (sin CSRF cookie)
      const res = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
        avatar: avatarBase64
      });

      const { user, token } = res.data;
      localStorage.setItem('token', token);
      login(user); // actualiza el contexto/UI

      // feedback de éxito en /perfil
      router.push('/perfil?ok=registro');
    } catch (err) {
      if (err?.response?.status === 422) {
        const apiErrors = err.response.data.errors || {};
        const formatted = {};
        Object.keys(apiErrors).forEach((k) => {
          formatted[k] = Array.isArray(apiErrors[k]) ? apiErrors[k][0] : String(apiErrors[k]);
        });
        setError(formatted);
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'No se pudo completar el registro.';
        setError(msg);
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
