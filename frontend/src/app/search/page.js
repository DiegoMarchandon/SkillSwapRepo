'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    if (!term.trim() && !nivel) return;
    setLoading(true);
    setErr(null);
    try {
      const params = { habilidad: term.trim() || undefined, tipo, nivel: nivel || undefined };
      const { data } = await api.get('/buscar', { params });
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setResults(list);
    } catch (error) {
      console.error('Error en la solicitud: ', error);
      setErr('No se pudieron obtener resultados.');
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
    <div className="max-w-4xl mx-auto p-6 bg-white text-gray-900 rounded-2xl shadow">
      <Header />
      <h1 className="text-2xl font-semibold mb-4">
        Buscar {tipo === 'ofrecida' ? 'profesores' : 'estudiantes'}
      </h1>

      <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2 rounded bg-linear-to-r from-stone-200 to-gray-400 p-4 shadow">
        <input
          className="flex-1 rounded border p-2"
          placeholder="Habilidad (p. ej., Java, Guitarra)"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />

        <select className="rounded border p-2" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="ofrecida">Profesores (enseñan)</option>
          <option value="deseada">Estudiantes (quieren aprender)</option>
        </select>

        <select className="rounded border p-2" value={nivel} onChange={(e) => setNivel(e.target.value)}>
          <option value="">Nivel (cualquiera)</option>
          {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <button className="rounded bg-blue-600 px-4 py-2 text-white">Buscar</button>
        <button type="button" onClick={clearAll} className="rounded bg-white/80 px-4 py-2">
          Limpiar
        </button>
      </form>

      <div className="rounded bg-white p-4 shadow mt-4">
        {loading ? (
          'Buscando…'
        ) : err ? (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
        ) : results.length ? (
          <ul className="divide-y">
            {results.map((row, i) => {
              const userId   = row?.user?.id;
              const userName = row?.user?.name ?? 'Usuario';
              const skillId  = row?.skill?.id;  
              const skillNom = row?.skill?.name ?? row?.skill?.nombre ?? 'Habilidad';
              const skillNiv = row?.skill?.nivel;
              const pivotId  = row?.skill?.pivot_id;

const goCalendario = () => {
  if (!userId) return;

  const params = new URLSearchParams();

  if (skillId) params.set('skill_id', String(skillId));
  if (userName) params.set('name', userName); // 👈 pasamos el nombre del instructor

  const q = params.toString() ? `?${params.toString()}` : '';
  router.push(`/instructores/${userId}${q}`);
};


              return (
                <li key={i} className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <div className="font-medium">{userName}</div>
                    <div className="text-sm text-gray-600">
                      {skillNom}{skillNiv ? ` · ${skillNiv}` : ''}
                    </div>
                  </div>

                  {tipo === 'ofrecida' && userId && (
                    <button
                      onClick={goCalendario}
                      className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Ver disponibilidad
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div>Sin resultados todavía.</div>
        )}
      </div>
    </div>
  );
}
