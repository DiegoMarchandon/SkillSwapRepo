// frontend/src/app/mi/disponibilidad/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';         // ⬅️ ruta correcta
import api from '../../../utils/axios';                          // ⬅️ ruta correcta
import { fromZonedTime } from 'date-fns-tz';                     // ⬅️ v3: zona -> UTC

const ZONE = 'America/Argentina/Salta';

export default function CargarDisponibilidadPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [habilidades, setHabilidades] = useState([]);
  const [habilidadId, setHabilidadId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [duracion, setDuracion] = useState(60);
  const [slots, setSlots] = useState([]);
  const [sending, setSending] = useState(false);
  const [screenMsg, setScreenMsg] = useState(null); // siempre mostramos algo

  // Cargar skills del usuario (sólo cuando hay user)
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setScreenMsg('Redirigiendo al login…');
      router.replace('/login?next=/mi/disponibilidad');
      return;
    }

    (async () => {
      try {
        setScreenMsg('Cargando habilidades…');
        const { data } = await api.get('/my-skills');  // lleva Bearer por interceptor
        const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        const opciones = list.map((it) => {
          const h =
            it.habilidad?.id ? it.habilidad :
            it.skill?.id     ? it.skill :
            it.habilidad_id  ? { id: it.habilidad_id, nombre: it.habilidad_nombre || it.nombre || it.name } :
                               { id: it.id, nombre: it.nombre || it.name };
          return { id: Number(h.id), nombre: h.nombre || h.name || `Habilidad #${h.id}` };
        });
        setHabilidades(opciones);
        setScreenMsg(null);
      } catch (e) {
        console.log('No pude cargar mis habilidades', e?.response?.status, e?.response?.data);
        setScreenMsg('No pude cargar tus habilidades. ¿Estás logueado?');
      }
    })();
  }, [loading, user, router]);

  function agregarSlot() {
    if (!habilidadId) return alert('Seleccioná una habilidad.');
    if (!fecha || !hora || !duracion) return alert('Completá fecha, hora y duración.');

    // fecha+hora en TU zona
    const [HH, MM] = hora.split(':').map(Number);
    const localStart = new Date(fecha);
    localStart.setHours(HH, MM ?? 0, 0, 0);

    // zona -> UTC (v3)
    const inicioUtc = fromZonedTime(localStart, ZONE);
    const finUtc = new Date(inicioUtc.getTime() + Number(duracion) * 60000);

    setSlots(prev => [...prev, {
      inicio_utc: inicioUtc.toISOString(),
      fin_utc:    finUtc.toISOString(),
    }]);
  }

  async function guardar() {
    if (!user?.id) return alert('Tenés que iniciar sesión.');
    if (!habilidadId) return alert('Seleccioná una habilidad.');
    if (!slots.length) return alert('Agregá al menos un slot.');

    const idNum = Number(habilidadId);
    if (!habilidades.some(h => h.id === idNum)) {
      return alert('La habilidad seleccionada no es válida.');
    }

    setSending(true);
    try {
      await api.post(`/instructores/${user.id}/disponibilidades`, {
        habilidad_id: idNum,
        slots,
      });
      alert('Disponibilidades creadas.');
      setSlots([]);
    } catch (e) {
      console.log('Respuesta error:', e?.response?.status, e?.response?.data);
      alert(e?.response?.data?.message || 'No se pudo guardar.');
    } finally {
      setSending(false);
    }
  }

  // UI — si hay mensaje de pantalla, lo mostramos siempre (evita “pantalla negra”)
  if (loading || screenMsg) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-300">
        {screenMsg || 'Cargando…'}
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Cargar disponibilidad</h1>

      <div className="bg-white/90 dark:bg-gray-900 rounded-2xl shadow p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Habilidad</label>
          <select
            className="w-full rounded border p-2 bg-white dark:bg-gray-800"
            value={habilidadId}
            onChange={e => setHabilidadId(e.target.value)}
          >
            <option value="">Elegí…</option>
            {habilidades.map(h => (
              <option key={h.id} value={h.id}>{h.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input type="date" className="w-full rounded border p-2 bg-white dark:bg-gray-800"
                 value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hora (local)</label>
          <input type="time" className="w-full rounded border p-2 bg-white dark:bg-gray-800"
                 value={hora} onChange={e => setHora(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Duración (min)</label>
          <input type="number" min={15} step={15}
                 className="w-full rounded border p-2 bg-white dark:bg-gray-800"
                 value={duracion} onChange={e => setDuracion(e.target.value)} />
        </div>

        <button type="button" onClick={agregarSlot}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
          Agregar a la lista
        </button>

        <div className="mt-2">
          <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">A crear:</h3>
          {slots.length === 0 ? (
            <p className="text-sm text-gray-500">Todavía no agregaste horarios.</p>
          ) : (
            <ul className="list-disc pl-5 text-sm">
              {slots.map((s, i) => (
                <li key={i} className="mb-1">{s.inicio_utc} → {s.fin_utc}</li>
              ))}
            </ul>
          )}
        </div>

        <button type="button" onClick={guardar} disabled={sending || slots.length === 0}
                className="mt-4 inline-flex items-center px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed">
          {sending ? 'Guardando…' : 'Guardar disponibilidades'}
        </button>
      </div>
    </main>
  );
}
