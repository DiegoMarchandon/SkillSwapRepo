import UserRow from "./UserRow";
// Componente: Lista de Usuarios
export default function UsersList({ users, onViewSessions, setSelectedUser }) {
    const handleViewSessions = (user) => {
      setSelectedUser(user);
      onViewSessions(user.id);
    };
  
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Usuarios Registrados ({users.length})
            </h2>
            <div className="text-sm text-gray-500">
              Total de usuarios en la plataforma
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Información
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estadísticas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  onViewSessions={handleViewSessions}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </div>
    );
  }