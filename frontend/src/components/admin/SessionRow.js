'use client';
import api from '../../utils/axios'; // <- ruta desde components/admin

export default function SessionRow({ session }) {
  // Identificador de la sesión/reserva que usa el backend
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
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const calidad = calcularCalidad(session.metrics);
  const fechaTxt = session.started_at ? new Date(session.started_at).toLocaleDateString() : '—';
  const roleBadge = session.role === 'instructor'
    ? { txt: '🎓 Instructor', cls: 'bg-purple-100 text-purple-800' }
    : { txt: '👨‍🎓 Estudiante', cls: 'bg-blue-100 text-blue-800' };

  const isReportable =
    ['finalizada', 'interrumpida'].includes(session.estado || session.status || '') ||
    (session.duration_minutes ?? 0) > 0;

  async function downloadReport(format) {
    console.log('🔄 IDs disponibles:', {
      reservaId,
      sessionId: session.id,
      sessionReservaId: session.reserva_id,
      session
    });
    try {
    const { data, headers, status } = await api.get(
      `/admin/sesiones/${reservaId}/reporte`,
      { params: { format }, responseType: 'blob' }
    );

    if (status >= 400) {
      // por si algún proxy deja pasar status >=400 como success
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
    // Si vino Blob con JSON de error, lo leo:
    try {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        const parsed = (() => { try { return JSON.parse(text); } catch { return null; }})();
        alert(parsed?.error || text || 'No se pudo generar el reporte.');
        return;
      }
    } catch {}
    alert(err?.message || 'No se pudo generar el reporte.');
    console.error('Error descargando reporte', err);
  }
}


  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">Sesión #{session.id}</div>
        <div className="text-sm text-gray-500">{session.skill_name || 'Sin habilidad específica'}</div>
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
          <div className="text-gray-500">{fechaTxt}</div>
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
              FPS: {session.metrics[0].fps || 0} | Pérdida: {session.metrics[0].packets_lost || 0}%
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.cls}`}>
          {roleBadge.txt}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {isReportable ? (
          <div className="flex gap-2">
            <button onClick={() => downloadReport('pdf')}  className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">PDF</button>
            <button onClick={() => downloadReport('csv')}  className="px-3 py-1.5 border rounded">CSV</button>
            <button onClick={() => downloadReport('html')} className="px-3 py-1.5 border rounded">HTML</button>
          </div>
        ) : (
          <span className="text-gray-400">No reportable</span>
        )}
      </td>
    </tr>
  );
}
