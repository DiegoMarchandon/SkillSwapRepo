'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const LABELS = { ofrecida: 'Enseño', deseada: 'Quiero aprender' };
const TIPOS = ['ofrecida','deseada'];

export default function SkillsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [tipo, setTipo] = useState('ofrecida');
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ nombre: '', nivel: '', estado: 'activa' });
  const [busy, setBusy] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  // proteger ruta
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  // SOLUCIÓN: Mover la lógica de load dentro de cada useEffect
  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      try {
        const { data } = await api.get('/my-skills', { params: { tipo: 'ofrecida' } });
        setList(data);
      } catch (e) {
        // opcional: toast.error('No se pudo cargar');
      } finally {
        setLoadingList(false);
      }
    };

    load();
  }, []); // Solo se ejecuta una vez al montar

  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      try {
        const { data } = await api.get('/my-skills', { params: { tipo } });
        setList(data);
      } catch (e) {
        // opcional: toast.error('No se pudo cargar');
      } finally {
        setLoadingList(false);
      }
    };

    load();
  }, [tipo]); // Se ejecuta cuando cambia el tipo

  const add = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error('Ingresá una habilidad'); return; }
    setBusy(true);
    try {
      const { data } = await api.post('/my-skills', {
        nombre: form.nombre.trim(),
        tipo,
        nivel: form.nivel || null,
        estado: form.estado,
      });
      // agregar resultado arriba
      setList(prev => [
        { id: data.id, name: data.habilidad.nombre, tipo: data.tipo, nivel: data.nivel, estado: data.estado },
        ...prev
      ]);
      setForm({ nombre: '', nivel: '', estado: 'activa' });
      toast.success('Habilidad agregada');
    } catch (e) {
      toast.error(e.response?.data?.message || 'No se pudo agregar');
    } finally {
      setBusy(false);
    }
  };

  const removeSkill = async (id) => {
    await api.delete(`/api/my-skills/${id}`);
    setList(prev => prev.filter(s => s.id !== id));
    toast.success('Eliminada');
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Mis habilidades</h1>

      <div className="flex gap-2">
        {TIPOS.map(t => (
          <button
            key={t}
            className={`px-3 py-1 rounded ${tipo===t?'bg-blue-600 text-white':'bg-gray-400'}`}
            onClick={()=>setTipo(t)}
          >
            {LABELS[t]}
          </button>
        ))}
      </div>

      <form onSubmit={add} className="grid gap-2 rounded bg-gray-400 p-4 shadow">
        <input
          className="rounded border p-2"
          placeholder="Nombre de la habilidad (p. ej., Java, Piano)"
          value={form.nombre}
          onChange={e=>setForm(s=>({...s, nombre:e.target.value}))}
        />
        <select
          className="bg-gray-500 rounded border p-2"
          value={form.nivel}
          onChange={e=>setForm(s=>({...s, nivel:e.target.value}))}
        >
          <option value="">Nivel (opcional)</option>
          <option value="principiante">Principiante</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            id="estadoChk"
            type="checkbox"
            className="h-4 w-4"
            checked={form.estado === 'activa'}
            onChange={e=>setForm(s=>({...s, estado: e.target.checked ? 'activa' : 'inactiva'}))}
          />
          <label htmlFor="estadoChk" className="text-sm">Activa</label>
        </div>

        <button disabled={busy} className={`w-max rounded bg-blue-600 px-4 py-2 text-white ${busy?'opacity-60':''}`}>
          {busy ? 'Agregando…' : 'Agregar'}
        </button>
      </form>

      <div className="rounded bg-gray-400 p-4 shadow">
        {loadingList ? 'Cargando…' : (
          list.length ? (
            <ul className="divide-y">
              {list.map(s => (
                <li key={s.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-400">
                      {LABELS[s.tipo]} {s.nivel ? `· ${s.nivel}` : ''} {s.estado === 'inactiva' ? '· inactiva' : ''}
                    </div>
                  </div>
                  <button onClick={()=>removeSkill(s.id)} className="text-red-600">Eliminar</button>
                </li>
              ))}
            </ul>
          ) : <div>No tenés habilidades cargadas en esta modalidad.</div>
        )}
      </div>
    </div>
  );
}