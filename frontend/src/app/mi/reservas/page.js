'use client';
import { useEffect, useState, useMemo, Suspense } from 'react';
import api from '../../../utils/axios';
import { toLocal } from '../../../utils/time';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gray-900">
      {/* Fondo consistente */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/30 to-cyan-900/20 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Título principal */}
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-4xl font-bold text-center text-white font-mono pixel-text"
          style={{ 
            fontFamily: 'VT323, monospace',
            textShadow: '2px 2px 0 #000, 4px 4px 0 rgba(103, 232, 249, 0.3)',
            letterSpacing: '2px'
          }}
        >
          MIS RESERVAS
        </motion.h1>

        {ok && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-none border-4 border-green-500 bg-green-900/50 px-6 py-4 text-green-300 font-mono text-lg text-center"
            style={{ boxShadow: '4px 4px 0 #000' }}
          >
            ✓ ¡RESERVA CONFIRMADA!
          </motion.div>
        )}
        
        {/* Modal de Rating - ACTUALIZADO con backdrop blur */}
        {ratingModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 border-4 border-gray-700 rounded-none shadow-2xl max-w-md w-full p-6"
              style={{ boxShadow: '8px 8px 0 #000' }}
            >
              <h3 className="text-2xl text-white font-bold mb-4 font-mono text-center"
                  style={{ fontFamily: 'VT323, monospace' }}>
                CALIFICAR SESIÓN
              </h3>
              <p className="text-gray-300 mb-6 text-center font-mono text-lg"
                 style={{ fontFamily: 'VT323, monospace' }}>
                ¿Cómo calificarías tu sesión con {ratingModal.instructor.name}?
              </p>
              
              {/* Estrellas */}
              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-4xl mx-2 focus:outline-none transform hover:scale-110 transition-transform"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              
              {/* Comentario */}
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="COMENTARIO OPCIONAL..."
                className="w-full bg-gray-700 text-white border-4 border-gray-600 rounded-none p-4 mb-6 resize-none font-mono text-lg"
                style={{ 
                  fontFamily: 'VT323, monospace',
                  boxShadow: '3px 3px 0 #000'
                }}
                rows="3"
              />
              
              {/* Botones */}
              <div className="flex gap-4">
                <button
                  onClick={() => setRatingModal(null)}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white border-4 border-gray-700 rounded-none hover:bg-gray-500 transition font-mono text-lg font-bold disabled:opacity-50"
                  style={{ 
                    boxShadow: '4px 4px 0 #000',
                    fontFamily: 'VT323, monospace'
                  }}
                >
                  CANCELAR
                </button>
                <button
                  onClick={enviarResena}
                  disabled={submitting || rating === 0}
                  className="flex-1 px-4 py-3 bg-cyan-500 text-gray-900 border-4 border-cyan-700 rounded-none hover:bg-cyan-400 transition font-mono text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    boxShadow: '4px 4px 0 #000',
                    fontFamily: 'VT323, monospace'
                  }}
                >
                  {submitting ? 'ENVIANDO...' : 'ENVIAR'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabla de reservas - COMPLETAMENTE REDISEÑADA */}
        <div className="bg-gray-800 border-4 border-gray-700 rounded-none backdrop-blur-sm bg-opacity-90 overflow-hidden"
             style={{ boxShadow: '8px 8px 0 #000' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full font-mono text-lg"
                   style={{ fontFamily: 'VT323, monospace' }}>
              <thead className="bg-gray-900/80 text-white">
                <tr>
                  <th className="px-6 py-4 border-b-4 border-gray-700 text-left">INSTRUCTOR</th>
                  <th className="px-6 py-4 border-b-4 border-gray-700 text-left">HORARIO</th>
                  <th className="px-6 py-4 border-b-4 border-gray-700 text-left">ESTADO</th>
                  <th className="px-6 py-4 border-b-4 border-gray-700 text-left">REUNIÓN</th>
                  <th className="px-6 py-4 border-b-4 border-gray-700 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-mono text-xl">
                      CARGANDO…
                    </td>
                  </tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-mono text-xl">
                      NO TENÉS RESERVAS AÚN.
                    </td>
                  </tr>
                )}

                {!loading && rows.map(r => {
                  const empieza = new Date(r.inicio_utc);
                  const puedeCancelar = ['confirmada','pendiente'].includes(r.estado) && now < empieza;
                  const tieneResena = r.resena_existente;

                  return (
                    <tr key={r.id} className="border-b-4 border-gray-700 hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-cyan-300">{r.instructor.name}</div>
                        <div className="text-gray-400 text-sm">{r.instructor.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{toLocal(r.inicio_utc, 'EEE d MMM HH:mm')}</div>
                        <div className="text-gray-400">– {toLocal(r.fin_utc, 'HH:mm')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-none border-2 font-bold text-sm
                          ${r.estado === 'confirmada' ? 'bg-green-900/50 border-green-500 text-green-300' :
                            r.estado === 'cancelada' ? 'bg-gray-600 border-gray-400 text-gray-300' :
                            r.estado === 'finalizada' ? 'bg-purple-900/50 border-purple-500 text-purple-300' :
                            'bg-cyan-900/50 border-cyan-500 text-cyan-300'}`}
                          style={{ boxShadow: '2px 2px 0 #000' }}>
                          {r.estado.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {r.estado === 'confirmada' && r.meeting_id && (
                          <Link 
                            href={`/meeting/${r.meeting_id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-2 border-blue-700 rounded-none hover:bg-blue-400 transition font-bold"
                            style={{ boxShadow: '3px 3px 0 #000' }}
                          >
                            🎥 UNIRSE
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {r.estado !== 'finalizada' ? (
                          <button
                            disabled={!puedeCancelar}
                            onClick={() => cancelar(r.id)}
                            className={`px-4 py-2 rounded-none border-2 font-bold transition
                              ${puedeCancelar
                                ? 'bg-red-500 text-white border-red-700 hover:bg-red-400'
                                : 'bg-gray-600 text-gray-400 border-gray-700 cursor-not-allowed'}`}
                            style={{ boxShadow: puedeCancelar ? '3px 3px 0 #000' : 'none' }}
                          >
                            CANCELAR
                          </button>
                        ) : (
                          <div>
                            {tieneResena ? (
                              <span className="text-green-400 font-bold text-lg">✓ CALIFICADA</span>
                            ) : (
                              <button
                                onClick={() => abrirRatingModal(r)}
                                className="px-4 py-2 bg-yellow-500 text-gray-900 border-2 border-yellow-700 rounded-none hover:bg-yellow-400 transition font-bold"
                                style={{ boxShadow: '3px 3px 0 #000' }}
                              >
                                ⭐ CALIFICAR
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
        </div>
      </div>
    </div>
  );
}

// Componente principal - ACTUALIZADO
export default function MisReservasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white font-mono text-2xl mb-4" style={{ fontFamily: 'VT323, monospace' }}>
            CARGANDO RESERVAS...
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
        </div>
      </div>
    }>
      <MisReservasContent />
    </Suspense>
  );
}