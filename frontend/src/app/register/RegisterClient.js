'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import RegisterForm from '../../components/forms/RegisterForm';
import api from '../../utils/axios';

// Para avatar (client-safe)
import { createAvatar } from '@dicebear/core';
import * as botttsNeutral from '@dicebear/bottts-neutral';

export default function RegisterClient({ next = '/perfil' }) {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1) Generar SVG avatar con seed = nombre
      const avatar = createAvatar(botttsNeutral, { seed: name || 'user' });
      const svg = avatar.toString();

      // 2) Pasar a base64 en el navegador (UTF-8-safe)
      const avatarBase64 = btoa(unescape(encodeURIComponent(svg)));

      // 3) Registrar
      const res = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
        avatar: avatarBase64,
      });

      const { user, token } = res.data;
      localStorage.setItem('token', token);
      login(user);

      // 4) Volver a donde estaba
      router.push(`${next}?ok=registro`);
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
    <div className="relative min-h-screen bg-[#0b0c10] text-[#e6f3ff]">
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* glows suaves, mismo tono que tu FAQ */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#9ae6ff]/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#67e8f9]/20 blur-3xl" />
    </div>

    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-2">
      {/* Panel de marca */}
      <section className="hidden md:flex flex-col justify-center">
        <h1 className="font-pixel text-3xl md:text-4xl text-[#cde8ff]">
          Crear cuenta <span className="text-[#67e8f9]">SkillSwap</span>
        </h1>
        <p className="mt-4 max-w-md text-[#bcd7f5]">
          Intercambiá habilidades por tiempo, no por dinero.
        </p>
        <ul className="mt-8 space-y-3 text-[#bcd7f5]">
          <li className="flex items-center gap-3">✓ Perfil con avatar automático</li>
          <li className="flex items-center gap-3">✓ Reservas seguras</li>
          <li className="flex items-center gap-3">✓ Sin comisiones, por tiempo</li>
        </ul>
      </section>

        {/* Card del formulario con borde “pixel” */}
      <section className="relative">
        <div className="rounded-none bg-[#0d1220] p-8 pixel-shadow">
          <div className="mb-6">
            <h2 className="font-pixel text-xl text-[#cde8ff]">Registrarse</h2>
            <p className="mt-2 text-sm text-[#a7c6ec]">
              ¿Ya tenés cuenta?{' '}
              <a href="/auth/login" className="underline underline-offset-4 text-[#67e8f9]">
                Iniciá sesión
              </a>
            </p>
          </div>

            <RegisterForm
              name={name} setName={setName}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              passwordConfirm={passwordConfirm} setPasswordConfirm={setPasswordConfirm}
              error={error} setError={setError}
              handleSubmit={handleSubmit}
            />
          </div>

          {/* Sombra sutil */}
          <div className="absolute inset-0 -z-10 translate-y-3 rounded-2xl bg-black/30 blur-xl" />
        </section>
      </div>
    </div>
  );
}
