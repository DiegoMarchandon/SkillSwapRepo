'use client';
import { useState } from 'react';

const RegisterForm = ({
  handleSubmit,
  name, setName,
  email, setEmail,
  password, setPassword,
  passwordConfirm, setPasswordConfirm,
  error
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // Soporta varios formatos de error (Laravel 422, objeto plano, etc.)
  const fieldError = (key) => {
    if (!error) return null;
    const errors =
      error?.response?.data?.errors ||
      error?.response?.errors ||
      error?.errors ||
      (typeof error === 'object' && !error?.response ? error : null);
    if (!errors) return null;
    const val = errors[key];
    return Array.isArray(val) ? val[0] : (val ? String(val) : null);
  };

  const globalMsg =
    error?.response?.data?.message ||
    (typeof error === 'string' ? error : '');

  async function onSubmit(e) {
    setSubmitting(true);
    try {
      await handleSubmit(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-none bg-[#0d1220] p-6 pixel-shadow text-[#e6f3ff]">
      <h1 className="mb-6 text-center font-pixel text-xl text-[#cde8ff]">
        Registro de usuarios
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Mensaje general */}
        {globalMsg && (
          <div className="rounded-none border-2 border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200 font-pixel">
            {globalMsg}
          </div>
        )}

        {/* Nombre */}
        <div>
          <label className="mb-1 block text-xs font-pixel text-[#cde8ff] uppercase tracking-wide">
            Nombre de usuario
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            aria-invalid={!!fieldError('name')}
            className={`w-full px-3 py-2 bg-transparent text-[#e6f3ff] placeholder:text-[#86a7cf]
                        rounded-none pixel-input ${fieldError('name') ? 'border-red-400' : ''}`}
          />
          {fieldError('name') && (
            <p className="mt-1 text-xs text-red-300 font-pixel">{fieldError('name')}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-xs font-pixel text-[#cde8ff] uppercase tracking-wide">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            aria-invalid={!!fieldError('email')}
            className={`w-full px-3 py-2 bg-transparent text-[#e6f3ff] placeholder:text-[#86a7cf]
                        rounded-none pixel-input ${fieldError('email') ? 'border-red-400' : ''}`}
          />
          {fieldError('email') && (
            <p className="mt-1 text-xs text-red-300 font-pixel">{fieldError('email')}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1 block text-xs font-pixel text-[#cde8ff] uppercase tracking-wide">
            Contraseña
          </label>
          <div className="flex items-center gap-2">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-invalid={!!fieldError('password')}
              className="w-full bg-transparent px-3 py-2 text-[#e6f3ff] placeholder:text-[#86a7cf] rounded-none pixel-input"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="px-3 py-2 text-xs font-pixel pixel-btn bg-[#cde8ff] text-[#0b0c10] border-2 border-[#0f172a]"
              aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPw ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {fieldError('password') && (
            <p className="mt-1 text-xs text-red-300 font-pixel">{fieldError('password')}</p>
          )}
        </div>

        {/* Confirmación */}
        <div>
          <label className="mb-1 block text-xs font-pixel text-[#cde8ff] uppercase tracking-wide">
            Confirmar contraseña
          </label>
          <div className="flex items-center gap-2">
            <input
              type={showPw2 ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="••••••••"
              aria-invalid={!!fieldError('password_confirmation')}
              className="w-full bg-transparent px-3 py-2 text-[#e6f3ff] placeholder:text-[#86a7cf] rounded-none pixel-input"
            />
            <button
              type="button"
              onClick={() => setShowPw2((v) => !v)}
              className="px-3 py-2 text-xs font-pixel pixel-btn bg-[#cde8ff] text-[#0b0c10] border-2 border-[#0f172a]"
              aria-label={showPw2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPw2 ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {fieldError('password_confirmation') && (
            <p className="mt-1 text-xs text-red-300 font-pixel">
              {fieldError('password_confirmation')}
            </p>
          )}
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={submitting}
          className="pixel-btn inline-flex h-11 w-full items-center justify-center rounded-none
                     border-2 border-[#0f172a] bg-[#cde8ff] px-4 font-pixel text-[#0b0c10]
                     hover:bg-[#bfe0ff] disabled:opacity-70 disabled:cursor-not-allowed"
          aria-busy={submitting}
        >
          {submitting ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
