'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/axios';
import { addMonths, endOfMonth, format, startOfMonth, startOfWeek, addDays, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { toLocal, ymdLocal } from '../../utils/time';

export default function InstructorCalendar({ instructorId, skillId }) {
  const router = useRouter();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(null);
  const [slots, setSlots] = useState([]);

  const range = useMemo(() => {
    const from = startOfMonth(month);
    const to = endOfMonth(month);
    return {
      from: new Date(from.getTime() - 7 * 24 * 3600 * 1000),
      to:   new Date(to.getTime()   + 7 * 24 * 3600 * 1000),
    };
  }, [month]);

  async function loadSlots() {
    setLoading(true);
    try {
      const params = { from: range.from.toISOString(), to: range.to.toISOString() };
      if (skillId) {
        params.skill_id = String(skillId);
        params.usuario_habilidad_id = String(skillId);
      }
      const qs = new URLSearchParams(params).toString();
      const { data } = await api.get(`/instructores/${instructorId}/calendario?` + qs);
      setSlots(data?.data || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadSlots(); }, [instructorId, range.from, range.to, skillId]);

  const byDay = useMemo(() => {
    const map = {};
    for (const s of slots) {
      // const key = ymdLocal(s.inicio_utc);
      const key = format(new Date(s.inicio_utc), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    Object.values(map).forEach((list) => list.sort((a, b) => a.inicio_utc.localeCompare(b.inicio_utc)));
    return map;
  }, [slots]);

  async function reservar(disponibilidad_id) {
    if (!confirm('¿Confirmar reserva de este horario?')) return;
    setSending(disponibilidad_id);
    try {
      await api.post('/reservas', { disponibilidad_id });
      router.push('/mi/reservas?ok=1'); // redirigir al listado
    } catch (e) {
      const msg = e?.response?.data?.message
        || e?.response?.data?.errors?.disponibilidad_id?.[0]
        || 'No se pudo reservar.';
      alert(msg);
      await loadSlots(); // por si cambió el estado del slot
    } finally {
      setSending(null);
    }
  }

  function Header() {
    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-2xl shadow-lg">
        <div>
          <h2 className="text-2xl font-semibold">Disponibilidad del instructor</h2>
          <p className="opacity-90">{format(month, 'MMMM yyyy', { locale: es })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMonth(addMonths(month, -1))} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20">←</button>
          <button onClick={() => setMonth(startOfMonth(new Date()))} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20">Hoy</button>
          <button onClick={() => setMonth(addMonths(month, 1))} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20">→</button>
        </div>
      </div>
    );
  }

  function Grid() {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1, locale: es });
    const days = [];
    for (let i = 0; i < 42; i++) days.push(addDays(start, i));
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return (
      <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4">
        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
          {weekDays.map((w) => <div key={w} className="py-2">{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, idx) => {
            const key = format(d, 'yyyy-MM-dd');
            const list = byDay[key] || [];
            const inMonth = isSameMonth(d, month);

            // DEBUG: Agregar console.log para verificar
            // console.log(`Día ${key}:`, list.length, 'slots');
            return (
              <div key={idx} className={`min-h-[120px] border rounded-xl p-2 flex flex-col gap-2 ${inMonth ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-gray-100/50 dark:bg-gray-800/20 text-gray-400'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{format(d, 'd')}</span>
                  {inMonth && list.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white">{list.length} slot{list.length > 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1 overflow-auto">
                  {list.length === 0 && <span className="text-xs text-gray-400">—</span>}
                  {list.map((s) => {
                    const libre = s.estado === 'libre';
                    return (
                      <button
                        key={s.id}
                        disabled={!libre || sending === s.id}
                        onClick={() => reservar(s.id)}
                        className={`w-full text-left text-xs rounded-lg px-2 py-1 border transition ${
                          libre
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-rose-50 border-rose-300 text-rose-800 opacity-80 cursor-not-allowed'
                        }`}
                        title={`${toLocal(s.inicio_utc)} - ${toLocal(s.fin_utc)}`}
                      >
                        {toLocal(s.inicio_utc, 'HH:mm')}–{toLocal(s.fin_utc, 'HH:mm')} {libre ? '• Libre' : '• Ocupado'}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <section className="space-y-4">{loading ? <div className="p-8 text-center text-gray-500">Cargando calendario…</div> : (<><Header /><Grid /></>)}</section>;
}
