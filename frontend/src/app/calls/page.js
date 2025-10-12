'use client';
import { useEffect, useState } from 'react';
import api from '../../utils/axios';
import Link from 'next/link';

export default function CallHistoryPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        
        const { data } = await api.get('/calls'); // ← endpoint protegido
        setCalls(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el historial de llamadas.');
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  if (loading) return <p className="p-4">Cargando historial...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Historial de llamadas</h1>
      {calls.length === 0 ? (
        <p>No hay llamadas registradas.</p>
      ) : (
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">#</th>
              <th className="py-2 px-4 border-b text-left">Emisor</th>
              <th className="py-2 px-4 border-b text-left">Receptor</th>
              <th className="py-2 px-4 border-b text-left">Estado</th>
              <th className="py-2 px-4 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call, i) => (
              <tr key={call.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{i + 1}</td>
                <td className="py-2 px-4 border-b">{call.caller_id}</td>
                <td className="py-2 px-4 border-b">{call.receiver_id}</td>
                <td className="py-2 px-4 border-b">{call.status}</td>
                <td className="py-2 px-4 border-b">
                  <Link
                    href={`/calls/${call.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver métricas
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
