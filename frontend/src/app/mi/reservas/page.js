'use client';
import { useEffect, useState, useMemo, Suspense } from 'react';
import api from '../../../utils/axios';
import { toLocal } from '../../../utils/time';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Componente que usa useSearchParams - debe estar envuelto en Suspense
function MisReservasContent() {
  const search = useSearchParams();
  const ok = search.get('ok') === '1';
  
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/mis-reservas');
      setRows(data.data || []);
    } catch(error) {
      console.log("Error en mis reservas", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    load(); 
  }, []);

  async function cancelar(id) {
    if (!confirm('¿Seguro que querés cancelar esta reserva?')) return;
    try {
      await api.patch(`/reservas/${id}/cancelar`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo cancelar.');
    }
  }

  function abrirRatingModal(reserva) {
    setRatingModal(reserva);
    setRating(0);
    setComentario('');
  }

  async function enviarResena() {
    if (rating === 0) {
      alert('Por favor, selecciona una calificación');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/resenas', {
        reserva_id: ratingModal.id,
        receptor_id: ratingModal.instructor.id,
        rating: rating,
        comentario: comentario
      });

      alert('¡Gracias por tu reseña!');
      setRatingModal(null);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Error al enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  }

  const now = useMemo(() => new Date(), []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Mis reservas</h1>
      {ok && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">
          ¡Reserva confirmada!
        </div>
      )}
      
      {/* Modal de Rating */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl text-black font-bold mb-4">Calificar sesión</h3>
            <p className="text-gray-600 mb-4">
              ¿Cómo calificarías tu sesión con {ratingModal.instructor.name}?
            </p>
            
            {/* Estrellas */}
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl mx-1 focus:outline-none"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            
            {/* Comentario */}
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comentario opcional..."
              className="w-full text-black border border-gray-300 rounded-lg p-3 mb-4 resize-none"
              rows="3"
            />
            
            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setRatingModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={enviarResena}
                disabled={submitting || rating === 0}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Enviar Reseña'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800/60 text-left">
            <tr>
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3">Horario</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Reunión</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Cargando…</td></tr>
            )}

            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No tenés reservas aún.</td></tr>
            )}

            {!loading && rows.map(r => {
              const empieza = new Date(r.inicio_utc);
              const puedeCancelar = ['confirmada','pendiente'].includes(r.estado) && now < empieza;
              const tieneResena = r.resena_existente;

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
                        r.estado === 'finalizada' ? 'bg-purple-100 text-purple-800' :
                        'bg-indigo-100 text-indigo-800'}`}>
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.estado === 'confirmada' && r.meeting_id && (
                      <Link 
                        href={`/meeting/${r.meeting_id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                      >
                        🎥 Unirse
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.estado !== 'finalizada' ? (
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
                    ) : (
                      <div>
                        {tieneResena ? (
                          <span className="text-green-600 text-sm">✓ Calificada</span>
                        ) : (
                          <button
                            onClick={() => abrirRatingModal(r)}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm"
                          >
                            ⭐ Calificar
                          </button>
                        )}
                      </div>
                    )}
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

// Componente principal
export default function MisReservasPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Mis reservas</h1>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
          <div className="px-4 py-6 text-center text-gray-500">Cargando reservas...</div>
        </div>
      </div>
    }>
      <MisReservasContent />
    </Suspense>
  );
}