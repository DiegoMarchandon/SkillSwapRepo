'use client';
import { useState } from 'react';
import api from '../../utils/axios';
import Header from '../../components/layout/Header';

export default function SearchPage() {
  const [tipo, setTipo] = useState('ofrecida'); // ofrecida = profesores (enseñan)
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!term.trim()) return;
    setLoading(true);
    try {
      console.log("enviando parámetros: ", { habilidad: term.trim(), tipo });
      const { data } = await api.get('/api/buscar', { params: { habilidad: term.trim(), tipo } });
      setResults(data);
    }catch(error){
      console.log('Error en la solicitud: ', error);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-gray-900 rounded-2xl shadow">
      <Header />
      <h1 className="text-2xl font-semibold">
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
        <button className="rounded cursor-pointer bg-stone-800 px-4 py-2 text-white">Buscar</button>
      </form>

      <div className="rounded bg-white p-4 shadow">
        {loading ? 'Buscando…' : (
          results.length ? (
            <ul className="divide-y">
              {results.map((r, i) => (
                <li key={i} className="flex items-center gap-3 py-2">
                  {/* {r.user.avatar_url && (
                    <img src={r.user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border" />
                  )} */}
                  <div className="flex-1">
                    <div className="font-medium">{r.user.name}</div>
                    <div className="text-sm text-gray-600">
                      {r.skill.name} {r.skill.level ? `· ${r.skill.level}` : ''}
                    </div>
                  </div>
                  {/* Futuro: botón "Contactar" o "Ver perfil" */}
                </li>
              ))}
            </ul>
          ) : <div>Sin resultados todavía.</div>
        )}
      </div>
    </div>
  );
}
