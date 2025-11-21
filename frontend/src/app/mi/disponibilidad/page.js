'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fromZonedTime } from 'date-fns-tz';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/axios';
import Header from '../../../components/layout/Header';

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
  const [screenMsg, setScreenMsg] = useState(null);

  // cargar skills del usuario
  useEffect(() => {
    if (loading) return;

    if (!user) {
      setScreenMsg('Redirigiendo al login…');
      router.replace('/login?next=/mi/disponibilidad');
      return;
    }

    (async () => {
      try {
        setScreenMsg('Cargando tus habilidades…');
        const { data } = await api.get('/my-skills');
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        const opciones = list.map((it) => {
          const h =
            it.habilidad?.id
              ? it.habilidad
              : it.skill?.id
              ? it.skill
              : it.habilidad_id
              ? {
                  id: it.habilidad_id,
                  nombre: it.habilidad_nombre || it.nombre || it.name,
                }
              : { id: it.id, nombre: it.nombre || it.name };
          return {
            id: Number(h.id),
            nombre: h.nombre || h.name || `Habilidad #${h.id}`,
          };
        });

        setHabilidades(opciones);
        setScreenMsg(null);
      } catch (e) {
        console.log(
          'No pude cargar mis habilidades',
          e?.response?.status,
          e?.response?.data
        );
        setScreenMsg(null);
        toast.error('No se pudieron cargar tus habilidades. Intentalo de nuevo.');
      }
    })();
  }, [loading, user, router]);

  function agregarSlot() {
    if (!habilidadId) {
      toast.error('Seleccioná una habilidad.');
      return;
    }
    if (!fecha || !hora || !duracion) {
      toast.error('Completá fecha, hora y duración.');
      return;
    }

    // ✅ construir la fecha/hora local sin el bug de "YYYY-MM-DD" en UTC
    const [year, month, day] = fecha.split('-').map(Number); // p.ej. 2025-11-25
    const [HH, MM] = hora.split(':').map(Number);            // p.ej. 20:00

    // Esto crea un Date en hora local (zona del sistema, Argentina)
    const localStart = new Date(year, month - 1, day, HH, MM ?? 0, 0, 0);

    // Interpretamos ese horario en la zona ZONE y lo convertimos a UTC
    const inicioUtcDate = fromZonedTime(localStart, ZONE);
    const finUtcDate = new Date(
      inicioUtcDate.getTime() + Number(duracion) * 60000
    );

    setSlots((prev) => [
      ...prev,
      {
        inicio_utc: inicioUtcDate.toISOString(),
        fin_utc: finUtcDate.toISOString(),
      },
    ]);

    toast.success('Slot agregado a la lista.');
  }

  function quitarSlot(idx) {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  }

  async function guardar() {
    if (!user?.id) {
      toast.error('Tenés que iniciar sesión.');
      return;
    }
    if (!habilidadId) {
      toast.error('Seleccioná una habilidad.');
      return;
    }
    if (!slots.length) {
      toast.error('Agregá al menos un horario.');
      return;
    }

    const idNum = Number(habilidadId);
    if (!habilidades.some((h) => h.id === idNum)) {
      toast.error('La habilidad seleccionada no es válida.');
      return;
    }

    setSending(true);
    try {
      await api.post(`/instructores/${user.id}/disponibilidades`, {
        habilidad_id: idNum,
        slots,
      });
      toast.success('Disponibilidades guardadas correctamente.');
      setSlots([]);
    } catch (e) {
      console.log('Respuesta error:', e?.response?.status, e?.response?.data);
      toast.error(e?.response?.data?.message || 'No se pudo guardar.');
    } finally {
      setSending(false);
    }
  }

  // pantalla de carga / redirección
  if (loading || screenMsg) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/25 via-blue-900/40 to-cyan-900/25 backdrop-blur-sm" />
        </div>
        <div
          className="relative z-10 text-center text-gray-100 text-2xl"
          style={{ fontFamily: 'VT323, monospace' }}
        >
          {screenMsg || 'CARGANDO…'}
        </div>
      </div>
    );
  }

  const formatLocal = (iso) =>
    new Date(iso).toLocaleString('es-AR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* fondo pixel */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/25 via-blue-900/40 to-cyan-900/25 backdrop-blur-sm" />
      </div>

      <Header />

      <main className="relative z-10 max-w-5xl mx-auto p-6">
        {/* título pixel */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-4xl font-bold text-center text-white"
          style={{
            fontFamily: 'VT323, monospace',
            textShadow: '2px 2px 0 #000, 4px 4px 0 rgba(103, 232, 249, 0.35)',
            letterSpacing: '2px',
          }}
        >
          CARGAR DISPONIBILIDAD
        </motion.h1>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Card formulario */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gray-900/90 border-4 border-gray-800 p-5 md:p-6"
            style={{ boxShadow: '8px 8px 0 #000' }}
          >
            <div className="pointer-events-none absolute inset-0 -z-10 translate-x-2 translate-y-2 bg-cyan-500/10 blur-xl" />

            <header className="mb-4">
              <h2
                className="text-2xl text-cyan-100"
                style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
              >
                NUEVOS HORARIOS
              </h2>
              <p className="text-xs md:text-sm text-gray-300">
                Elegí la habilidad y cargá los horarios en los que podés dar clases.
              </p>
            </header>

            <div className="space-y-4">
              {/* Habilidad */}
              <div>
                <label
                  className="block mb-1 text-[11px] text-gray-300"
                  style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                >
                  HABILIDAD
                </label>
                <select
                  className="w-full px-3 py-2 rounded-none border-4 border-gray-800 bg-gray-950 text-gray-100 text-sm focus:outline-none focus:border-cyan-400"
                  style={{ fontFamily: 'VT323, monospace' }}
                  value={habilidadId}
                  onChange={(e) => setHabilidadId(e.target.value)}
                >
                  <option value="">Elegí…</option>
                  {habilidades.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* fecha / hora / duración */}
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label
                    className="block mb-1 text-[11px] text-gray-300"
                    style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                  >
                    FECHA
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-none border-4 border-gray-800 bg-gray-950 text-gray-100 text-sm focus:outline-none focus:border-cyan-400"
                    style={{ fontFamily: 'VT323, monospace' }}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="block mb-1 text-[11px] text-gray-300"
                    style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                  >
                    HORA (LOCAL)
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 rounded-none border-4 border-gray-800 bg-gray-950 text-gray-100 text-sm focus:outline-none focus:border-cyan-400"
                    style={{ fontFamily: 'VT323, monospace' }}
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="block mb-1 text-[11px] text-gray-300"
                    style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                  >
                    DURACIÓN (MIN)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    className="w-full px-3 py-2 rounded-none border-4 border-gray-800 bg-gray-950 text-gray-100 text-sm focus:outline-none focus:border-cyan-400"
                    style={{ fontFamily: 'VT323, monospace' }}
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={agregarSlot}
                  className="px-4 py-2 text-xs md:text-sm border-4 border-black bg-emerald-300 text-gray-900 shadow-[4px_4px_0_#000] hover:bg-emerald-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                  style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
                >
                  AGREGAR A LA LISTA
                </button>
              </div>
            </div>
          </motion.section>

          {/* Card vista previa slots */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gray-900/90 border-4 border-gray-800 p-5 md:p-6 flex flex-col"
            style={{ boxShadow: '8px 8px 0 #000' }}
          >
            <header className="mb-4 flex items-center justify-between">
              <h2
                className="text-2xl text-cyan-100"
                style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
              >
                HORARIOS A CREAR
              </h2>
              <span
                className="px-3 py-1 border-2 border-gray-700 bg-gray-800/90 text-[11px] text-gray-200"
                style={{ fontFamily: 'VT323, monospace' }}
              >
                {slots.length ? `${slots.length} slot(s)` : 'Ningún horario aún'}
              </span>
            </header>

            <div className="flex-1 overflow-auto">
              {slots.length === 0 ? (
                <p
                  className="text-gray-400 text-sm text-center mt-6"
                  style={{ fontFamily: 'VT323, monospace' }}
                >
                  Todavía no agregaste horarios.
                </p>
              ) : (
                <ul className="space-y-2">
                  {slots.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center justify_between gap-2 px-3 py-2 border-2 border-gray-700 bg-gray-800 text-gray-100 text-sm"
                      style={{ fontFamily: 'VT323, monospace', boxShadow: '3px 3px 0 #000' }}
                    >
                      <div className="flex-1">
                        <div>{formatLocal(s.inicio_utc)}</div>
                        <div className="text-gray-400 text-xs">
                          →{' '}
                          {new Date(s.fin_utc).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          (UTC convertido)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => quitarSlot(i)}
                        className="px-2 py-1 border-2 border-red-700 bg-red-500 text-xs text-white hover:bg-red-400"
                        style={{ boxShadow: '2px 2px 0 #000' }}
                      >
                        X
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={guardar}
                disabled={sending || slots.length === 0}
                className="px-5 py-2 text-xs md:text-sm border-4 border-black bg-emerald-300 text-gray-900 shadow-[4px_4px_0_#000] hover:bg-emerald-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: 'VT323, monospace', letterSpacing: '1px' }}
              >
                {sending ? 'GUARDANDO…' : 'GUARDAR DISPONIBILIDADES'}
              </button>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
