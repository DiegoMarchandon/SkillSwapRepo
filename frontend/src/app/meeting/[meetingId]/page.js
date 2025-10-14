// app/meeting/[meetingId]/page.js
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../utils/axios';

export default function MeetingPage() {
  const params = useParams();
  const meetingId = params.meetingId;
  
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    loadMeetingData();
  }, [meetingId]);

  async function loadMeetingData() {
    try {
      const { data } = await api.get(`/api/meeting/${meetingId}`);
      setReserva(data.reserva);
      setIsInstructor(data.isInstructor);
      setMeetingStarted(data.meetingStarted);
    } catch (error) {
      console.error('Error loading meeting:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startMeeting() {
    try {
      await api.post(`/api/meeting/${meetingId}/start`);
      setMeetingStarted(true);
      initializeWebRTC();
    } catch (error) {
      console.error('Error starting meeting:', error);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('Enlace copiado al portapapeles!');
  }

  function initializeWebRTC() {
    // Aquí integras tu WebRTC component existente
    console.log('Inicializando WebRTC...');
    // Tu lógica actual de page.js
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando reunión...</div>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Reunión no encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sala de espera */}
      {!meetingStarted && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
              🕐 Sala de Espera
            </h1>
            
            {/* Información de usuarios */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-xl border-2 ${
                isInstructor 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <h3 className="font-semibold mb-2">
                  Tú ({isInstructor ? 'Instructor' : 'Alumno'})
                </h3>
                <p className="text-sm text-gray-600">
                  {reserva.current_user.name} - {reserva.current_user.email}
                </p>
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                !isInstructor 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <h3 className="font-semibold mb-2">
                  {isInstructor ? 'Alumno' : 'Instructor'}
                </h3>
                <p className="text-sm text-gray-600">
                  {reserva.other_user.name} - {reserva.other_user.email}
                </p>
                <p className="text-sm mt-2">
                  Estado: <span className="text-orange-600">Esperando...</span>
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 mb-6">
              {isInstructor ? (
                <button
                  onClick={startMeeting}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  🎬 Iniciar Reunión
                </button>
              ) : (
                <div className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg">
                  Esperando que el instructor inicie la reunión...
                </div>
              )}
              
              <button
                onClick={copyLink}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                📋 Copiar Enlace
              </button>
            </div>

            {/* Información de la reunión */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Información de la reunión</h3>
              <p><strong>ID:</strong> {meetingId}</p>
              <p><strong>Enlace:</strong> 
                <input 
                  type="text" 
                  value={window.location.href} 
                  readOnly 
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-white text-sm"
                />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Videollamada */}
      {meetingStarted && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🎥 Reunión en curso
            </h1>
            
            {/* Aquí integras tu componente WebRTC existente */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <p className="text-gray-500 mb-4">
                Componente WebRTC se cargará aquí...
              </p>
              {/* 
                Reemplaza esto con tu componente de videollamada existente:
                <WebRTCComponent meetingId={meetingId} />
              */}
              <button 
                onClick={initializeWebRTC}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Inicializar Videollamada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}