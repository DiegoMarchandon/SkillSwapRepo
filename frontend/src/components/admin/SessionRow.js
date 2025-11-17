'use client';

import { toast } from 'react-hot-toast';
import api from '../../utils/axios';

export default function SessionRow({ session }) {
  // ID de la reserva/sesión para el backend
  const reservaId = session.reserva_id ?? session.id;

  const calcularCalidad = (metrics) => {
    if (!metrics || metrics.length === 0) return 0;
    const ultima = metrics[metrics.length - 1];
    let score = 100;
    if ((ultima?.packets_lost ?? 0) > 5) score -= 20;
    if ((ultima?.jitter ?? 0) > 30) score -= 15;
    if ((ultima?.latency ?? 0) > 200) score -= 10;
    if ((ultima?.fps ?? 0) < 15) score -= 15;
    return Math.max(0, score);
  };

  const getCalidadColor = (score) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60';
    if (score >= 60) return 'bg-amber-500/20 text-amber-300 border-amber-400/60';
    return 'bg-rose-500/20 text-rose-300 border-rose-400/60';
  };

  const calidad = calcularCalidad(session.metrics);
  const fechaTxt = session.started_at
    ? new Date(session.started_at).toLocaleDateString()
    : '—';

  const roleBadge =
    session.role === 'instructor'
      ? { txt: '🎓 Instructor', cls: 'bg-violet-500/20 text-violet-200 border border-violet-400/60' }
      : { txt: '👨‍🎓 Estudiante', cls: 'bg-sky-500/20 text-sky-200 border border-sky-400/60' };

  // Regla de "reportable":
  // Antes: solo finalizada/interrumpida o duración > 0.
  // Ahora: mientras exista reservaId la mostramos como reportable
  // (si el backend no puede generar reporte, mostrará un toast de error).
  const isReportable = !!reservaId;

  async function downloadReport(format) {
    try {
      const { data, headers, status } = await api.get(
        `/admin/sesiones/${reservaId}/reporte`,
        { params: { format }, responseType: 'blob' },
      );

      if (status >= 400) {
        const text = await data.text();
        throw new Error(text || 'Error desconocido');
      }

      const type = headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);

      if (format === 'html') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-sesion-${reservaId}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      URL.revokeObjectURL(url);
    } catch (err) {
      // Intentamos leer JSON de error si vino en un Blob
      try {
        if (err.response?.data instanceof Blob) {
          const text = await err.response.data.text();
          const parsed = (() => {
            try {
              return JSON.parse(text);
            } catch {
              return null;
            }
          })();
          toast.error(parsed?.error || text || 'No se pudo generar el reporte.');
          return;
        }
      } catch {
        // ignoramos errores de parseo
      }

      toast.error(err?.message || 'No se pudo generar el reporte.');
      console.error('Error descargando reporte', err);
    }
  }

  return (
    <tr className="hover:bg-slate-800/70">
      {/* Sesión */}
      <td className="px-4 md:px-6 py-3 align-top">
        <div className="text-[12px] font-semibold text-slate-50">
          Sesión #{session.id}
        </div>
        <div className="text-[11px] text-slate-400">
          {session.skill_name || 'Sesión de SkillSwap'}
        </div>
      </td>

      {/* Participantes */}
      <td className="px-4 md:px-6 py-3 align-top">
        <div className="text-[11px] text-slate-200">
          <div>Instructor: User {session.instructor_id}</div>
          <div>Estudiante: User {session.student_id}</div>
        </div>
      </td>

      {/* Duración & fecha */}
      <td className="px-4 md:px-6 py-3 align-top">
        <div className="text-[11px] text-slate-200">
          <div>{session.duration_minutes || 0} minutos</div>
          <div className="text-slate-400">{fechaTxt}</div>
        </div>
      </td>

      {/* Métricas */}
      <td className="px-4 md:px-6 py-3 align-top">
        <div className="text-[11px] space-y-1 text-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Calidad:</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold ${getCalidadColor(
                calidad,
              )}`}
            >
              {calidad}%
            </span>
          </div>
          {session.metrics?.[0] && (
            <div className="text-slate-400 text-[10px]">
              FPS: {session.metrics[0].fps || 0} · Pérdida:{' '}
              {session.metrics[0].packets_lost || 0}%
            </div>
          )}
        </div>
      </td>

      {/* Rol */}
      <td className="px-4 md:px-6 py-3 align-top">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${roleBadge.cls}`}
        >
          {roleBadge.txt}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 md:px-6 py-3 align-top">
        {isReportable ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => downloadReport('pdf')}
              className="px-3 py-1.5 text-[11px] bg-indigo-500 text-white border-[2px] border-black shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              PDF
            </button>
            <button
              onClick={() => downloadReport('csv')}
              className="px-3 py-1.5 text-[11px] bg-slate-900 text-slate-100 border-[2px] border-slate-400 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-slate-800 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              CSV
            </button>
            <button
              onClick={() => downloadReport('html')}
              className="px-3 py-1.5 text-[11px] bg-slate-900 text-slate-100 border-[2px] border-slate-400 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-slate-800 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              HTML
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500">No reportable</span>
        )}
      </td>
    </tr>
  );
}
