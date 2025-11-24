// components/admin/SessionRow.jsx
'use client';

export default function SessionRow({ session }) {
  const instructorName = session.instructor_name ?? `User ${session.instructor_id}`;
  const studentName    = session.student_name    ?? `User ${session.student_id}`;

  const duration = session.duration_minutes ?? 0;
  const date     = session.started_at ? new Date(session.started_at) : null;

  const roleLabel =
    session.role === 'instructor'
      ? 'Instructor'
      : session.role === 'student'
      ? 'Estudiante'
      : 'Participante';

  const quality = session.quality ?? 0; // o el campo que uses para calidad

  return (
    <tr>
      {/* Columna SESIÓN */}
      <td className="px-4 md:px-6 py-3 align-top">
        <div className="font-semibold text-xs md:text-sm">
          Sesión #{session.id}
        </div>
        <div className="text-[10px] text-slate-300">
          {session.skill_name || 'Sesión de SkillSwap'}
        </div>
      </td>

      {/* Columna PARTICIPANTES */}
      <td className="px-4 md:px-6 py-3 align-top text-[11px] md:text-xs">
        <div>Instructor: <span className="text-cyan-300">{instructorName}</span></div>
        <div>Estudiante: <span className="text-cyan-300">{studentName}</span></div>
      </td>

      {/* Columna DURACIÓN & FECHA */}
      <td className="px-4 md:px-6 py-3 align-top text-[11px] md:text-xs">
        <div>{duration} minutos</div>
        {date && (
          <div className="text-[10px] text-slate-400">
            {date.toLocaleDateString('es-AR')}
          </div>
        )}
      </td>

      {/* Columna MÉTRICAS */}
      <td className="px-4 md:px-6 py-3 align-top text-[11px] md:text-xs">
        <span className="mr-1">Calidad:</span>
        <span className="inline-flex items-center px-2 py-[1px] rounded-full bg-rose-900/60 text-rose-200 text-[10px]">
          {quality}%
        </span>
      </td>

      {/* Columna ROL */}
      <td className="px-4 md:px-6 py-3 align-top">
        <span
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-[11px]"
        >
          <span>🎓</span>
          {roleLabel}
        </span>
      </td>

      {/* Columna ACCIONES (PDF/CSV/HTML) */}
      <td className="px-4 md:px-6 py-3 align-top space-y-1">
        <a
          href={`/api/admin/sesiones/${session.id}/reporte?format=pdf`}
          target="_blank"
          className="block text-center text-[11px] bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded-sm"
        >
          PDF
        </a>
        <a
          href={`/api/admin/sesiones/${session.id}/reporte?format=csv`}
          target="_blank"
          className="block text-center text-[11px] bg-slate-200 hover:bg-slate-100 text-slate-900 px-3 py-1 rounded-sm"
        >
          CSV
        </a>
        <a
          href={`/api/admin/sesiones/${session.id}/reporte?format=html`}
          target="_blank"
          className="block text-center text-[11px] bg-slate-200 hover:bg-slate-100 text-slate-900 px-3 py-1 rounded-sm"
        >
          HTML
        </a>
      </td>
    </tr>
  );
}
