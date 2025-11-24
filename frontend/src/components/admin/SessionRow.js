// components/admin/SessionRow.jsx
'use client';

import { toast } from 'react-hot-toast';
import api from '../../utils/axios';

export default function SessionRow({ session }) {
  // ID que espera el backend para el reporte
  const reservaId = session.reserva_id ?? session.id;

  // --- Cálculo de calidad a partir de metrics ---
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

  const instructorName = session.instructor_name ?? `User ${session.instructor_id}`;
  const studentName    = session.student_name    ?? `User ${session.student_id}`;

  const calidad  = calcularCalidad(session.metrics || []);
  const duration = session.duration_minutes ?? 0;
  const dateObj  = session.started_at ? new Date(session.started_at) : null;

  // Rol del usuario en esa sesión
  const role = session.role === 'instructor'
    ? 'instructor'
    : session.role === 'student'
    ? 'student'
    : 'participant';

  const roleBadge = role === 'instructor'
    ? {
        txt: '🎓 Instructor',
        cls: 'bg-violet-500/20 text-violet-200 border border-violet-400/60',
      }
    : role === 'student'
    ? {
        txt: '👨‍🎓 Estudiante',
        cls: 'bg-sky-500/20 text-sky-200 border border-sky-400/60',
      }
    : {
        txt: '👥 Participante',
        cls: 'bg-slate-700/60 text-slate-100 border border-slate-500/60',
      };

  // Mientras haya reservaId consideramos que se puede pedir reporte
  const isReportable = !!reservaId;

  // --- Descarga de reporte (PDF / CSV / HTML) ---
  async function downloadReport(format) {
    if (!reservaId) {
      toast.error('Esta sesión no tiene datos suficientes para generar un reporte.');
      return;
    }

    try {
      const response = await api.get(`/admin/sesiones/${reservaId}/reporte`, {
        params: { format },
        responseType: 'blob',
      });

      const { data, headers } = response;
      const type = headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([data], { type });
      const url  = URL.createObjectURL(blob);

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
      
      try {
        if (err.response?.data instanceof Blob) {
          const text = await err.response.data.text();
          let msg = text;

          try {
            const parsed = JSON.parse(text);
            msg = parsed.error || parsed.message || text;
          } catch {
            
          }

          toast.error(msg || 'No se pudo generar el reporte.');
          console.error('Error descargando reporte', err);
          return;
        }
      } catch {
        
      }

      toast.error(err?.message || 'No se pudo generar el reporte.');
      console.error('Error descargando reporte', err);
    }
  }

  return (
    <tr className="hover:bg-slate-800/70">
      {/* SESIÓN */}
      <td className="px-4 md:px-6 py-3 align-top">
        <div className="font-semibold text-xs md:text-sm text-slate-50">
          Sesión #{session.id}
        </div>
        <div className="text-[10px] text-slate-300">
          {session.skill_name || 'Sesión de SkillSwap'}
        </div>
      </td>

      {/* PARTICIPANTES */}
      <td className="px-4 md:px-6 py-3 align-top text-[11px] md:text-xs">
        <div>
          Instructor:{' '}
          <span className="text-cyan-300">{instructorName}</span>
        </div>
        <div>
          Estudiante:{' '}
          <span className="text-cyan-300">{studentName}</span>
        </div>
      </td>

      {/* DURACIÓN & FECHA */}
      <td className="px-4 md:px-6 py-3 align-top text-[11px] md:text-xs">
        <div>{duration} minutos</div>
        {dateObj && (
          <div className="text-[10px] text-slate-400">
            {dateObj.toLocaleDateString('es-AR')}
          </div>
        )}
      </td>

      {/* MÉTRICAS */}
      <td className="px-4 md:px-6 py-3 align-top text-[11px] md:text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-slate-300">Calidad:</span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold ${getCalidadColor(
              calidad
            )}`}
          >
            {calidad}%
          </span>
        </div>

        {session.metrics?.[0] && (
          <div className="text-[10px] text-slate-400">
            FPS: {session.metrics[0].fps ?? 0} · Pérdida:{' '}
            {session.metrics[0].packets_lost ?? 0}% · Latencia:{' '}
            {session.metrics[0].latency ?? 0} ms
          </div>
        )}
      </td>

      {/* ROL */}
      <td className="px-4 md:px-6 py-3 align-top">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] ${roleBadge.cls}`}
        >
          {roleBadge.txt}
        </span>
      </td>

      {/* ACCIONES: PDF / CSV / HTML */}
      <td className="px-4 md:px-6 py-3 align-top">
        {isReportable ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => downloadReport('pdf')}
              className="
                px-3 py-1.5 text-[11px]
                bg-indigo-500 text-white
                border-[2px] border-black
                shadow-[2px_2px_0_rgba(0,0,0,1)]
                hover:translate-x-[1px] hover:translate-y-[1px]
                active:translate-x-[2px] active:translate-y-[2px]
              "
            >
              PDF
            </button>
            <button
              type="button"
              onClick={() => downloadReport('csv')}
              className="
                px-3 py-1.5 text-[11px]
                bg-slate-900 text-slate-100
                border-[2px] border-slate-400
                shadow-[2px_2px_0_rgba(0,0,0,1)]
                hover:bg-slate-800
                hover:translate-x-[1px] hover:translate-y-[1px]
                active:translate-x-[2px] active:translate-y-[2px]
              "
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => downloadReport('html')}
              className="
                px-3 py-1.5 text-[11px]
                bg-slate-900 text-slate-100
                border-[2px] border-slate-400
                shadow-[2px_2px_0_rgba(0,0,0,1)]
                hover:bg-slate-800
                hover:translate-x-[1px] hover:translate-y-[1px]
                active:translate-x-[2px] active:translate-y-[2px]
              "
            >
              HTML
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500">
            No reportable
          </span>
        )}
      </td>
    </tr>
  );
}
