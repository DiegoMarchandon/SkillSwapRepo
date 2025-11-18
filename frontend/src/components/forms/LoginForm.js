'use client';
import React, { useState } from 'react';

function normalizeErrors(err) {
  if (!err) return [];
  if (Array.isArray(err)) return err.map(String);

  const d = err?.response?.data ?? err;
  if (d && typeof d === 'object' && d.errors && typeof d.errors === 'object') {
    return Object.values(d.errors).flat().map(String);
  }
  if (typeof d?.message === 'string') return [d.message];
  if (typeof d === 'string') return [d];
  if (err?.message) return [String(err.message)];
  return ['Ocurrió un error inesperado.'];
}

// extrae error por campo si viene de Laravel 422 u objeto plano
function fieldErrorOf(error, key) {
  if (!error) return null;
  const errors =
    error?.response?.data?.errors ||
    error?.response?.errors ||
    error?.errors ||
    (typeof error === 'object' && !error?.response ? error : null);
  if (!errors) return null;
  const v = errors[key];
  return Array.isArray(v) ? v[0] : (v ? String(v) : null);
}

const LoginForm = ({
  email, setEmail,
  password, setPassword,
  error,
  handleSubmit,
  next = '/perfil', // opcional para link a registro
}) => {
  const errors = normalizeErrors(error);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(e) {
    setSubmitting(true);
    try {
      await handleSubmit(e);
    } finally {
      setSubmitting(false);
    }
  }

  const emailErr = fieldErrorOf(error, 'email');
  const passErr  = fieldErrorOf(error, 'password');

  return (
    <div className="w-full max-w-md rounded-none bg-[#0d1220] p-6 pixel-shadow text-[#e6f3ff]">
      <h1 className="mb-6 text-center font-pixel text-xl text-[#cde8ff]">
        Iniciar sesión
      </h1>

      {/* Alerta general */}
      {errors.length > 0 && (
        <div className="mb-4 rounded-none border-2 border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200 font-pixel">
          <ul className="list-disc pl-5">
            {errors.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-pixel text-[#cde8ff] uppercase tracking-wide"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="tu@email.com"
            aria-invalid={!!emailErr}
            className={`w-full px-3 py-2 bg-transparent text-[#e6f3ff] placeholder:text-[#86a7cf]
                        rounded-none pixel-input ${emailErr ? 'border-red-400' : ''}`}
            required
          />
          {emailErr && (
            <p className="mt-1 text-xs text-red-300 font-pixel">{emailErr}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-xs font-pixel text-[#cde8ff] uppercase tracking-wide"
          >
            Contraseña
          </label>
          <div className="flex items-center gap-2">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="••••••••"
              aria-invalid={!!passErr}
              className="w-full bg-transparent px-3 py-2 text-[#e6f3ff] placeholder:text-[#86a7cf] rounded-none pixel-input"
              required
            />
            <button
              type="button"
              onClick={()=>setShowPw(v=>!v)}
              className="px-3 py-2 text-xs font-pixel pixel-btn bg-[#cde8ff] text-[#0b0c10] border-2 border-[#0f172a]"
              aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPw ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {passErr && (
            <p className="mt-1 text-xs text-red-300 font-pixel">{passErr}</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="pixel-btn inline-flex h-11 items-center justify-center rounded-none
                       border-2 border-[#0f172a] bg-[#cde8ff] px-4 font-pixel text-[#0b0c10]
                       hover:bg-[#bfe0ff] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? 'Ingresando…' : 'Entrar'}
          </button>

          <p className="text-xs text-[#a7c6ec]">
            ¿No tenés cuenta?{' '}
            <a
              href={`/register?next=${encodeURIComponent(next)}`}
              className="underline underline-offset-4 text-[#67e8f9]"
            >
              Registrate
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
