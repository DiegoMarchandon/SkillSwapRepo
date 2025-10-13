// Componente: Fila de Usuario
export default function UserRow({ user, onViewSessions }) {
    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            <div>ID: {user.id}</div>
            <div>Registrado: {new Date(user.created_at).toLocaleDateString()}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 space-y-1">
            <div>Sesiones: {user.stats?.total_sessions || 0}</div>
            <div>Como instructor: {user.stats?.as_instructor || 0}</div>
            <div>Como estudiante: {user.stats?.as_student || 0}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button
            onClick={() => onViewSessions(user)}
            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            Ver Historial
          </button>
        </td>
      </tr>
    );
  }