'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../utils/axios';

export default function CallDetailPage() {
  const { id } = useParams();  // <-- obtiene el valor [id] de la URL
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCall = async () => {
      try {
        const { data } = await api.get(`/calls/${id}`);
        setCall(data);
      } catch (err) {
        console.error(err);
        setError('Error al obtener los datos de la llamada.');
      } finally {
        setLoading(false);
      }
    };

    fetchCall();
  }, [id]);

  if (loading) return <p className="p-4">Cargando métricas...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!call) return <p className="p-4">No se encontraron datos.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Métricas de la llamada #{call.id}
      </h1>
      <p className="text-gray-600 mb-4">
        Emisor: {call.caller_id} | Receptor: {call.receiver_id} | Estado:{' '}
        <span className="font-medium">{call.status}</span>
      </p>

      {call.metrics?.length ? (
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Usuario</th>
              <th className="py-2 px-4 border-b text-left">Timestamp</th>
              <th className="py-2 px-4 border-b text-left">Bytes Enviados</th>
              <th className="py-2 px-4 border-b text-left">Bytes Recibidos</th>
              <th className="py-2 px-4 border-b text-left">FPS</th>
              <th className="py-2 px-4 border-b text-left">Latencia (ms)</th>
              <th className="py-2 px-4 border-b text-left">Paquetes Perdidos</th>
              <th className="py-2 px-4 border-b text-left">Jitter</th>
            </tr>
          </thead>
          <tbody>
            {call.metrics.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{m.user_id}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(m.timestamp).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">{m.bytes_sent ?? '-'}</td>
                <td className="py-2 px-4 border-b">{m.bytes_received ?? '-'}</td>
                <td className="py-2 px-4 border-b">{m.fps ?? '-'}</td>
                <td className="py-2 px-4 border-b">{m.latency ?? '-'}</td>
                <td className="py-2 px-4 border-b">{m.packets_lost ?? '-'}</td>
                <td className="py-2 px-4 border-b">{m.jitter ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No se registraron métricas para esta llamada.</p>
      )}
    </div>
  );
}
