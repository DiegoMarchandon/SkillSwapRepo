import SessionRow from './SessionRow';

// Componente: Historial de Sesiones del Usuario
export default function UserSessions({ user, sessions, loading }) {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial de sesiones...</p>
        </div>
      );
    }
  
    return (
      <div className="space-y-6">
        {/* Resumen del Usuario */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">Total Sesiones</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {sessions.length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">Como Instructor</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {sessions.filter(s => s.role === 'instructor').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">Como Estudiante</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {sessions.filter(s => s.role === 'student').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-600">Tiempo Total</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {Math.round(sessions.reduce((total, s) => total + (s.duration_minutes || 0), 0))} min
            </div>
          </div>
        </div>
  
        {/* Lista de Sesiones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Sesiones ({sessions.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sesión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración & Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Métricas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </tbody>
            </table>
          </div>
          
          {sessions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay sesiones registradas para este usuario
            </div>
          )}
        </div>
      </div>
    );
  }
  