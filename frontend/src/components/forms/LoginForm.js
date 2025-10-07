'use client';
import React from 'react';

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

const LoginForm = ({ email, setEmail, password, setPassword, error, handleSubmit }) => {
  const errors = normalizeErrors(error);

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold text-blue-400 mb-4">Iniciar Sesión</h1>

      <form className="bg-white rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
        {/* @csrf ← quitar, esto es de Blade */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Correo Electrónico</label>
          <input
            id="email" type="email" name="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese su correo electrónico"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Contraseña</label>
          <input
            id="password" type="password" name="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Iniciar Sesión
          </button>
          <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="/register">
            ¿No tienes cuenta? Regístrate
          </a>
        </div>
      </form>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded relative mb-4">
          <ul className="list-disc pl-5">
            {errors.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
