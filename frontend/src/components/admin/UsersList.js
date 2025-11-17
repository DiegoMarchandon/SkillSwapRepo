'use client';

// Lista de usuarios con estilo dark/pixel
export default function UsersList({ users = [], onViewSessions, setSelectedUser }) {
  const handleViewSessions = (u) => {
    // Debug para confirmar el click
    console.log('Ver historial de usuario', u.id);
    if (setSelectedUser) setSelectedUser(u);
    if (onViewSessions) onViewSessions(u.id);
  };

  return (
    <div className="font-sans text-xs md:text-sm text-slate-100">
      {/* Cabecera pequeña dentro del panel */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="font-pixel tracking-[0.15em] uppercase text-[11px] md:text-xs">
            Usuarios registrados ({users.length})
          </h2>
          <p className="text-[11px] md:text-xs text-slate-300">
            Total de cuentas creadas en la plataforma.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] md:text-xs uppercase tracking-[0.12em] text-slate-300">
              <th className="px-3 py-1 text-left">Usuario</th>
              <th className="px-3 py-1 text-left hidden md:table-cell">Información</th>
              <th className="px-3 py-1 text-left hidden md:table-cell">Estadísticas</th>
              <th className="px-3 py-1 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => {
              const totalSessions = u.total_sessions ?? u.sessions_count ?? 0;
              const asInstructor = u.sessions_as_instructor ?? u.instructor_sessions ?? 0;
              const asStudent = u.sessions_as_student ?? u.student_sessions ?? 0;

              return (
                <tr key={u.id}>
                  <td colSpan={4}>
                    {/* “Tarjeta” por usuario */}
                    <div
                      className="
                        grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_auto]
                        md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_auto]
                        gap-3 items-center
                        border-[2px] border-slate-700 bg-slate-900/80
                        px-3 py-2
                        hover:bg-slate-800 transition-colors
                        shadow-[3px_3px_0_0_rgba(0,0,0,1)]
                      "
                    >
                      {/* Columna usuario */}
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 flex items-center justify-center rounded-full bg-violet-500 text-[11px] font-semibold">
                            {(u.name || 'U')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[12px] md:text-sm font-medium">
                              {u.name ?? 'Usuario sin nombre'}
                            </p>
                            <p className="text-[11px] text-slate-300 truncate max-w-[180px] md:max-w-xs">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Información extra */}
                      <div className="hidden md:block text-[11px] text-slate-300">
                        <p>ID: {u.id}</p>
                        {u.created_at && (
                          <p>
                            Registrado:{' '}
                            {new Date(u.created_at).toLocaleDateString('es-AR')}
                          </p>
                        )}
                      </div>

                      {/* Estadísticas */}
                      <div className="hidden md:block text-[11px] text-slate-300">
                        <p>Sesiones: {totalSessions}</p>
                        <p>Como instructor: {asInstructor}</p>
                        <p>Como estudiante: {asStudent}</p>
                      </div>

                      {/* Acciones */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleViewSessions(u)}
                          className="
                            border-[2px] border-violet-300 bg-slate-900 px-3 py-1
                            text-[10px] md:text-xs font-pixel uppercase tracking-[0.12em]
                            text-violet-200
                            hover:bg-violet-500 hover:text-black
                            hover:translate-x-[1px] hover:translate-y-[1px]
                            active:translate-x-[2px] active:translate-y-[2px]
                            shadow-[2px_2px_0_0_rgba(0,0,0,1)]
                          "
                        >
                          Ver historial
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[11px] text-slate-400">
                  No hay usuarios registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
