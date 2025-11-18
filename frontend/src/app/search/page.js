'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';
import Header from '../../components/layout/Header';

const NIVELES = ['principiante', 'intermedio', 'avanzado'];

export default function SearchPage() {
  const router = useRouter();

  const [tipo, setTipo] = useState('ofrecida'); // ofrecida = profesores (enseñan)
  const [nivel, setNivel] = useState('');       // filtro opcional
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();

    if (!term.trim() && !nivel) {
      const msg = 'Ingresá al menos una habilidad o seleccioná un nivel para buscar.';
      setErr(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const params = {
        habilidad: term.trim() || undefined,
        tipo,
        nivel: nivel || undefined,
      };
      const { data } = await api.get('/buscar', { params });
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setResults(list);
    } catch (error) {
      console.error('Error en la solicitud: ', error);
      const msg = 'No se pudieron obtener resultados.';
      setErr(msg);
      toast.error(msg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setTerm('');
    setTipo('ofrecida');
    setNivel('');
    setResults([]);
    setErr(null);
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Fondo con gradiente y leve blur, igual onda que Preferencias */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/25 via-blue-900/40 to-cyan-900/25 backdrop-blur-sm" />
      </div>

      <Header />

      <main className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Título principal estilo pixel */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-4xl font-bold text-center text-white"
          style={{
            fontFamily: 'VT323, monospace',
            textShadow: '2px 2px 0 #000, 4px 4px 0 rgba(103, 232, 249, 0.35)',
            letterSpacing: '2px',
          }}
        >
          BUSCAR HABILIDADES
        </motion.h2>

        <section className="space-y-6">
          {/* CARD: Buscador */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gray-900/90 border-4 border-gray-800 p-5 md:p-6"
            style={{ boxShadow: '8px 8px 0 #000' }}
          >
            {/* “Fondo 3D” suave */}
            <div className="pointer-events-none absolute inset-0 -z-10 translate-x-2 translate-y-2 bg-cyan-500/10 blur-xl" />

            <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3
                  className="text-2xl text-cyan-100"
                  style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                >
                  ENCONTRÁ TU MATCH IDEAL
                </h3>
                <p className="text-xs md:text-sm text-gray-300">
                  Buscá profesores o estudiantes según habilidad y nivel.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-gray-300">
                <span className="px-2 py-1 border-2 border-gray-700 bg-gray-800/80 uppercase tracking-widest"
                  style={{ fontFamily: 'VT323, monospace' }}
                >
                  {tipo === 'ofrecida' ? 'MODO PROFESORES' : 'MODO ESTUDIANTES'}
                </span>
                {nivel && (
                  <span className="px-2 py-1 border-2 border-gray-700 bg-gray-800/80 capitalize"
                    style={{ fontFamily: 'VT323, monospace' }}
                  >
                    Nivel: {nivel}
                  </span>
                )}
              </div>
            </header>

            {/* Formulario */}
            <form
              onSubmit={onSubmit}
              className="space-y-4 md:space-y-0 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto_auto] md:gap-3"
            >
              {/* Habilidad */}
              <div className="col-span-2">
                <label
                  className="block mb-1 text-[11px] text-gray-300"
                  style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                >
                  HABILIDAD
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Ej: Laravel, Guitarra, Japonés…"
                  className="w-full px-4 py-3 rounded-none border-4 border-gray-800 bg-gray-950 text-gray-100 text-sm focus:outline-none focus:border-cyan-400"
                  style={{
                    fontFamily: 'VT323, monospace',
                    letterSpacing: '1px',
                    boxShadow: '4px 4px 0 #000',
                  }}
                />
              </div>

              {/* Tipo (profesores / estudiantes) */}
              <div>
                <label
                  className="block mb-1 text-[11px] text-gray-300"
                  style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                >
                  ROL
                </label>
                <select
                  className="w-full px-3 py-2 rounded-none border-4 border-gray-800 bg-gray-950 text-gray-100 text-sm focus:outline-none focus:border-cyan-400"
                  style={{ fontFamily: 'VT323, monospace' }}
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="ofrecida">Profesores (enseñan)</option>
                  <option value="deseada">Estudiantes (quieren aprender)</option>
                </select>
              </div>

              {/* Nivel */}
              <div>
                <label
                  className="block mb-1 text-[11px] text-gray-300"
                  style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                >
                  NIVEL
                </label>
                <select
                  className="w-full px-3 py-2 rounded-none border-4 border-gray-800 bg-gray-950 text-gray-100 text-sm focus:outline-none focus:border-cyan-400"
                  style={{ fontFamily: 'VT323, monospace' }}
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                >
                  <option value="">Cualquiera</option>
                  {NIVELES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-2 items-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs md:text-sm border-4 border-black bg-emerald-300 text-gray-900 hover:bg-emerald-200 shadow-[4px_4px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                  style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                >
                  {loading ? 'BUSCANDO…' : 'BUSCAR'}
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-4 py-2 text-xs md:text-sm border-4 border-black bg-gray-700 text-gray-100 hover:bg-gray-600 shadow-[4px_4px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                  style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                >
                  LIMPIAR
                </button>
              </div>

              {err && (
                <div className="col-span-full mt-3 border-4 border-red-700 bg-red-900/60 text-red-100 px-4 py-2 text-[11px]"
                  style={{ fontFamily: 'VT323, monospace' }}
                >
                  {err}
                </div>
              )}
            </form>
          </motion.div>

          {/* CARD: Resultados */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gray-900/90 border-4 border-gray-800 p-5 md:p-6"
            style={{ boxShadow: '8px 8px 0 #000' }}
          >
            <header className="mb-3 flex items-center justify-between gap-2">
              <h3
                className="text-xl text-cyan-100"
                style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
              >
                RESULTADOS
              </h3>
              <span
                className="px-2 py-1 border-2 border-gray-700 bg-gray-800/90 text-[11px] text-gray-200"
                style={{ fontFamily: 'VT323, monospace' }}
              >
                {results.length ? `Encontrados: ${results.length}` : 'Sin resultados'}
              </span>
            </header>

            {loading ? (
              <div className="py-8 flex flex-col items-center gap-3 text-xs text-gray-300">
                <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span style={{ fontFamily: 'VT323, monospace' }}>
                  Buscando coincidencias…
                </span>
              </div>
            ) : results.length ? (
              <ul className="divide-y-2 divide-gray-800">
                {results.map((row, i) => {
                  const userId = row?.user?.id;
                  const userName = row?.user?.name ?? 'Usuario';
                  const skillId = row?.skill?.id;
                  const skillNom =
                    row?.skill?.name ?? row?.skill?.nombre ?? 'Habilidad';
                  const skillNiv = row?.skill?.nivel;
                  const pivotId = row?.skill?.pivot_id; // por si después lo usás

                  const goCalendario = () => {
                    if (!userId) return;

                    const params = new URLSearchParams();
                    if (skillId) params.set('skill_id', String(skillId));
                    if (userName) params.set('name', userName);

                    const q = params.toString() ? `?${params.toString()}` : '';
                    router.push(`/instructores/${userId}${q}`);
                  };

                  const rolBadge =
                    tipo === 'ofrecida'
                      ? { txt: 'PROFESOR', cls: 'bg-indigo-300 text-gray-900' }
                      : { txt: 'ESTUDIANTE', cls: 'bg-emerald-300 text-gray-900' };

                  return (
                    <motion.li
                      key={i}
                      whileHover={{ x: 4, scale: 1.01 }}
                      className="py-3 flex flex-col gap-2 md:flex-row md:items-center md:gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className="text-sm md:text-base text-white"
                            style={{ fontFamily: 'VT323, monospace' }}
                          >
                            {userName}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 border-2 border-black text-[10px] rounded-none shadow-[2px_2px_0_#000] ${rolBadge.cls}`}
                            style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                          >
                            {rolBadge.txt}
                          </span>
                        </div>
                        <div className="text-[12px] md:text-xs text-gray-300">
                          <span className="uppercase" style={{ fontFamily: 'VT323, monospace' }}>
                            {skillNom}
                          </span>
                          {skillNiv && (
                            <span className="capitalize text-gray-300 ml-1"
                              style={{ fontFamily: 'VT323, monospace' }}
                            >
                              · Nivel {skillNiv}
                            </span>
                          )}
                        </div>
                      </div>

                      {tipo === 'ofrecida' && userId && (
                        <div className="flex md:justify-end">
                          <button
                            onClick={goCalendario}
                            className="px-4 py-1.5 text-xs md:text-sm border-4 border-black bg-indigo-300 text-gray-900 shadow-[4px_4px_0_#000] hover:bg-indigo-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                            style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                          >
                            VER DISPONIBILIDAD
                          </button>
                        </div>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400"
                style={{ fontFamily: 'VT323, monospace' }}
              >
                No hay resultados todavía. Probá buscando otra habilidad o nivel.
              </div>
            )}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
