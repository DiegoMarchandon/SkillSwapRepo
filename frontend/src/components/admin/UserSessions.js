'use client';

import SessionRow from './SessionRow';

export default function UserSessions({ user, sessions, loading }) {
  if (loading) {
    return (
      <div className="border-[3px] border-cyan-300 bg-slate-900 text-slate-100 px-6 py-10 mx-auto max-w-6xl font-mono shadow-[5px_5px_0_rgba(0,0,0,1)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-200">
            Cargando historial de sesiones...
          </p>
        </div>
      </div>
    );
  }

  const totalSesiones   = sessions.length;
  const comoInstructor  = sessions.filter((s) => s.role === 'instructor').length;
  const comoEstudiante  = sessions.filter((s) => s.role === 'student').length;
  const totalMinutos    = Math.round(
    sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0),
  );

  return (
    <div className="space-y-5 font-mono text-slate-100">
      {/* Cards de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-3 shadow-[3px_3px_0_rgba(0,0,0,1)]">
          <div className="text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-slate-300">
            Total sesiones
          </div>
          <div className="mt-2 text-2xl md:text-3xl font-semibold">
            {totalSesiones}
          </div>
        </div>

        <div className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-3 shadow-[3px_3px_0_rgba(0,0,0,1)]">
          <div className="text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-slate-300">
            Como instructor
          </div>
          <div className="mt-2 text-2xl md:text-3xl font-semibold">
            {comoInstructor}
          </div>
        </div>

        <div className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-3 shadow-[3px_3px_0_rgba(0,0,0,1)]">
          <div className="text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-slate-300">
            Como estudiante
          </div>
          <div className="mt-2 text-2xl md:text-3xl font-semibold">
            {comoEstudiante}
          </div>
        </div>

        <div className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-3 shadow-[3px_3px_0_rgba(0,0,0,1)]">
          <div className="text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-slate-300">
            Tiempo total
          </div>
          <div className="mt-2 text-2xl md:text-3xl font-semibold">
            {totalMinutos} <span className="text-sm">min</span>
          </div>
        </div>
      </div>

      {/* Tabla de sesiones */}
      <div className="rounded-md border border-slate-700 bg-slate-900/80 shadow-[4px_4px_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-slate-700">
          <h3 className="text-sm md:text-base font-semibold tracking-[0.18em] uppercase">
            Historial de sesiones ({totalSesiones})
          </h3>
          {user && (
            <span className="hidden md:inline text-[11px] text-slate-300">
              Usuario:{' '}
              <span className="text-cyan-300">{user.name}</span> · ID {user.id}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] md:text-xs">
            <thead className="bg-slate-800 border-b border-slate-700 text-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-2 text-left font-semibold tracking-[0.12em] uppercase">
                  Sesión
                </th>
                <th className="px-4 md:px-6 py-2 text-left font-semibold tracking-[0.12em] uppercase">
                  Participantes
                </th>
                <th className="px-4 md:px-6 py-2 text-left font-semibold tracking-[0.12em] uppercase">
                  Duración &amp; fecha
                </th>
                <th className="px-4 md:px-6 py-2 text-left font-semibold tracking-[0.12em] uppercase">
                  Métricas
                </th>
                <th className="px-4 md:px-6 py-2 text-left font-semibold tracking-[0.12em] uppercase">
                  Rol
                </th>
                <th className="px-4 md:px-6 py-2 text-left font-semibold tracking-[0.12em] uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </tbody>
          </table>
        </div>

        {sessions.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-slate-400">
            No hay sesiones registradas para este usuario.
          </div>
        )}
      </div>
    </div>
  );
}
