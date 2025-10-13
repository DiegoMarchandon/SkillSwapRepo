// Componente: Fila de Sesión
export default function SessionRow({ session }) {
    const calcularCalidad = (metrics) => {
      if (!metrics || metrics.length === 0) return 0;
      const ultima = metrics[metrics.length - 1];
      let score = 100;
      
      if (ultima.packets_lost > 5) score -= 20;
      if (ultima.jitter > 30) score -= 15;
      if (ultima.latency > 200) score -= 10;
      if (ultima.fps < 15) score -= 15;
      
      return Math.max(0, score);
    };
  
    const getCalidadColor = (score) => {
      if (score >= 80) return 'text-green-600 bg-green-100';
      if (score >= 60) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    };
  
    const calidad = calcularCalidad(session.metrics);
  
    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">
            Sesión #{session.id}
          </div>
          <div className="text-sm text-gray-500">
            {session.skill_name || 'Sin habilidad específica'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            <div>Instructor: User {session.instructor_id}</div>
            <div>Estudiante: User {session.student_id}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            <div>{session.duration_minutes || 0} minutos</div>
            <div className="text-gray-500">
              {new Date(session.started_at).toLocaleDateString()}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span>Calidad:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCalidadColor(calidad)}`}>
                {calidad}%
              </span>
            </div>
            {session.metrics?.[0] && (
              <div className="text-gray-500 text-xs">
                FPS: {session.metrics[0].fps || 0} | 
                Pérdida: {session.metrics[0].packets_lost || 0}%
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            session.role === 'instructor' 
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {session.role === 'instructor' ? '🎓 Instructor' : '👨‍🎓 Estudiante'}
          </span>
        </td>
      </tr>
    );
  }