'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { toLocal } from '../../utils/time';

export default function InstructorCalendar({ instructorId, skillId, instructorName }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotToConfirm, setSlotToConfirm] = useState(null); // 👈 nuevo estado para el modal

  // Nombre que mostramos: prioridad props → query → fallback
  const nameFromQuery = searchParams.get('name');
  const displayName =
    instructorName ||
    nameFromQuery ||
    `Instructor #${instructorId ?? ''}`;

  const range = useMemo(() => {
    const from = startOfMonth(month);
    const to = endOfMonth(month);
    return {
      from: new Date(from.getTime() - 7 * 24 * 3600 * 1000),
      to: new Date(to.getTime() + 7 * 24 * 3600 * 1000),
    };
  }, [month]);

  const loadSlots = useCallback(async () => {
    if (!instructorId) return;
    setLoading(true);
    try {
      const params = { from: range.from.toISOString(), to: range.to.toISOString() };
      if (skillId) params.skill_id = String(skillId);
      const { data } = await api.get(`/instructores/${instructorId}/calendario`, { params });
      setSlots(data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error('No se pudieron cargar los horarios del instructor.');
    } finally {
      setLoading(false);
    }
  }, [instructorId, range.from, range.to, skillId]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const byDay = useMemo(() => {
    const map = {};
    for (const s of slots) {
      const key = format(new Date(s.inicio_utc), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.inicio_utc.localeCompare(b.inicio_utc)),
    );
    return map;
  }, [slots]);

  // Ahora reservar usa el slot guardado en el modal, no el confirm() del navegador
  const reservar = useCallback(
    async () => {
      if (!slotToConfirm) return;

      setSending(slotToConfirm.id);
      try {
        await api.post('/reservas', { disponibilidad_id: slotToConfirm.id });
        router.push('/mi/reservas?ok=1');
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.errors?.disponibilidad_id?.[0] ||
          'No se pudo reservar el turno.';
        toast.error(msg);
        await loadSlots();
      } finally {
        setSending(null);
        setSlotToConfirm(null);
      }
    },
    [router, loadSlots, slotToConfirm],
  );

  function Header() {
    return (
      <div className="flex items-center justify-between border-b-[3px] border-black bg-slate-300 px-4 py-3 md:px-6 md:py-4 text-slate-900 font-mono">
        <div>
          <h2 className="text-base md:text-lg font-semibold tracking-tight">
            Disponibilidad de {displayName}
          </h2>
          <p className="text-xs md:text-sm mt-1 capitalize">
            {format(month, 'MMMM yyyy', { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, -1))}
            className="h-9 w-9 md:w-10 inline-flex items-center justify-center border-[3px] border-black bg-slate-200 text-xs font-semibold hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-slate-100 active:translate-x-[2px] active:translate-y-[2px] shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
            aria-label="Mes anterior"
          >
            {'<'}
          </button>
          <button
            type="button"
            onClick={() => setMonth(startOfMonth(new Date()))}
            className="hidden md:inline-flex items-center justify-center h-9 px-4 border-[3px] border-black bg-emerald-300 text-xs font-semibold hover:bg-emerald-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, 1))}
            className="h-9 w-9 md:w-10 inline-flex items-center justify-center border-[3px] border-black bg-slate-200 text-xs font-semibold hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-slate-100 active:translate-x-[2px] active:translate-y-[2px] shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
            aria-label="Mes siguiente"
          >
            {'>'}
          </button>
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
      <div className="px-4 pb-4 pt-3 md:px-6 md:pb-6 md:pt-4">
        {/* cabecera de días */}
        <div className="grid grid-cols-7 text-center text-[11px] md:text-xs font-mono font-semibold text-slate-200 mb-2">
          {weekDays.map((w) => (
            <div key={w} className="py-1.5 border-b border-slate-700">
              {w.toUpperCase()}
            </div>
          ))}
        </div>

        {/* grilla de días */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {days.map((d, idx) => {
            const key = format(d, 'yyyy-MM-dd');
            const list = byDay[key] || [];
            const inMonth = isSameMonth(d, month);
            const current = isToday(d);

            let cell =
              'group min-h-[110px] p-1.5 flex flex-col gap-1.5 border-[2px] bg-slate-900 text-slate-100 transition-all duration-150 ease-out';
            if (inMonth) {
              cell += ' border-slate-600';
            } else {
              cell += ' border-slate-900 text-slate-500';
            }
            if (current) {
              cell += ' border-cyan-300 bg-slate-800';
            }

            return (
              <div
                key={idx}
                className={`${cell} hover:-translate-y-[2px] hover:bg-slate-800/90 hover:shadow-[3px_3px_0_0_rgba(34,211,238,0.85)]`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] md:text-xs font-mono font-semibold group-hover:text-emerald-300">
                    {format(d, 'd')}
                  </span>
                  {inMonth && list.length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 border-[2px] border-black bg-emerald-300 text-[10px] font-mono font-semibold text-black group-hover:bg-emerald-200 group-hover:-translate-y-[1px] transition-transform duration-150">
                      {list.length} slot{list.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1 overflow-auto pr-0.5">
                  {list.length === 0 && (
                    <span className="text-[11px] text-slate-500 font-mono group-hover:text-slate-300 transition-colors duration-150">
                      Sin turnos
                    </span>
                  )}

                  {list.map((s) => {
                    const libre = s.estado === 'libre';
                    const baseBtn =
                      'w-full text-left text-[11px] md:text-xs px-2 py-1 flex items-center justify-between gap-1 border-[2px] font-mono transition shadow-[2px_2px_0_0_rgba(0,0,0,1)]';
                    const freeStyles =
                      'bg-emerald-300 text-black border-black hover:bg-emerald-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]';
                    const busyStyles =
                      'bg-rose-300 text-black border-black opacity-80 cursor-not-allowed';

                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!libre || sending === s.id}
                        onClick={() => setSlotToConfirm(s)}   // 👈 abrimos el modal
                        className={`${baseBtn} ${libre ? freeStyles : busyStyles}`}
                        title={`${toLocal(s.inicio_utc)} - ${toLocal(s.fin_utc)}`}
                      >
                        <span>
                          {toLocal(s.inicio_utc, 'HH:mm')} - {toLocal(s.fin_utc, 'HH:mm')}
                        </span>
                        <span className="text-[10px] font-semibold">
                          {libre ? 'Libre' : 'Ocupado'}
                        </span>
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

  const showConfirm = !!slotToConfirm;

  return (
    <section className="space-y-4">
      {/* Botón volver */}
      <div className="mx-auto max-w-6xl flex justify-start">
        <button
          type="button"
          onClick={() => router.push('/search')}
          className="mb-2 inline-flex items-center gap-2 border-[3px] border-cyan-300 
                     bg-slate-900 px-4 py-2 font-mono text-xs md:text-sm 
                     text-slate-100 shadow-[3px_3px_0_0_rgba(0,0,0,1)] 
                     hover:bg-slate-800 hover:translate-x-[1px] hover:translate-y-[1px] 
                     active:translate-x-[2px] active:translate-y-[2px]"
        >
          <span className="text-lg">←</span>
          <span>Volver a la búsqueda</span>
        </button>
      </div>

      {loading ? (
        <div className="mx-auto max-w-6xl border-[3px] border-black bg-slate-900 text-slate-200 px-6 py-8 text-center font-mono shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
          Cargando calendario…
        </div>
      ) : (
        <div className="mx-auto max-w-6xl border-[3px] border-cyan-300 bg-slate-900 text-slate-100 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <Header />
          <Grid />
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[90%] max-w-md border-[3px] border-cyan-300 bg-slate-900 text-slate-100 p-5 md:p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] font-mono">
            <h3 className="text-lg mb-2">Confirmar reserva</h3>
            <p className="text-sm mb-4">
              Vas a reservar un turno con <span className="font-semibold">{displayName}</span>{' '}
              el{' '}
              <span className="font-semibold">
                {toLocal(slotToConfirm.inicio_utc, "dd/MM/yyyy")}
              </span>{' '}
              de{' '}
              <span className="font-semibold">
                {toLocal(slotToConfirm.inicio_utc, "HH:mm")} -{" "}
                {toLocal(slotToConfirm.fin_utc, "HH:mm")}
              </span>.
            </p>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSlotToConfirm(null)}
                className="px-3 py-1 border-[3px] border-black bg-slate-200 text-slate-900 text-sm shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-slate-100 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={reservar}
                disabled={sending === slotToConfirm.id}
                className="px-3 py-1 border-[3px] border-black bg-emerald-300 text-black text-sm shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-emerald-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-60"
              >
                {sending === slotToConfirm.id ? 'Reservando…' : 'Confirmar reserva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
