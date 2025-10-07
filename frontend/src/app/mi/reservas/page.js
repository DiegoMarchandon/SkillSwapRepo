'use client';
import { useEffect, useState, useMemo } from 'react';
import api from '../../../utils/axios';
import { toLocal } from '../../../utils/time';

export default function MisReservasPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/mis-reservas');
      setRows(data.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function cancelar(id) {
    if (!confirm('¿Seguro que querés cancelar esta reserva?')) return;
    try {
      await api.patch(`/reservas/${id}/cancelar`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo cancelar.');
    }
  }

  const now = useMemo(() => new Date(), [loading]); // recalcular cuando recarga

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Mis reservas</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800/60 text-left">
            <tr>
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3">Horario</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Cargando…</td></tr>
            )}

            {!loading && rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No tenés reservas aún.</td></tr>
            )}

            {!loading && rows.map(r => {
              const empieza = new Date(r.inicio_utc);
              const puedeCancelar = ['confirmada','pendiente'].includes(r.estado) && now < empieza;
              return (
                <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.instructor.name}</div>
                    <div className="text-gray-500">{r.instructor.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {toLocal(r.inicio_utc, 'EEE d MMM HH:mm')}–{toLocal(r.fin_utc, 'HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs
                      ${r.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-800' :
                        r.estado === 'cancelada' ? 'bg-gray-200 text-gray-700' :
                        'bg-indigo-100 text-indigo-800'}`}>
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={!puedeCancelar}
                      onClick={() => cancelar(r.id)}
                      className={`px-3 py-1.5 rounded-lg border transition
                        ${puedeCancelar
                          ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                          : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
