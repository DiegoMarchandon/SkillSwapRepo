// app/meeting/[meetingId]/page.js
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../utils/axios';

export default function MeetingPage() {
  const params = useParams();
  const meetingId = params.meetingId;
  
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [waitingRoomStatus, setWaitingRoomStatus] = useState({
    instructor_connected: false,
    alumno_connected: false,
    both_connected:false
  });

  useEffect(() => {
    async function loadMeetingData() {
      try {
        const { data } = await api.get(`/meeting/${meetingId}`);
        setReserva(data.reserva);
        setIsInstructor(data.isInstructor);
        setMeetingStarted(data.meetingStarted);
        console.log("hola");
      } catch (error) {
        console.error('Error loading meeting:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMeetingData();
  }, [meetingId]);

    // 1. REGISTRAR PRESENCIA AL CARGAR
    useEffect(() => {
      const registerPresence = async () => {
        try {
          await api.post(`/meeting/${meetingId}/join-waiting-room`);
        } catch (error) {
          console.error('Error registrando presencia:', error);
        }
      };
  
      if (reserva) {
        registerPresence();
        
        // Re-registrar cada 2 minutos
        const interval = setInterval(registerPresence, 120000);
        return () => clearInterval(interval);
      }
    }, [meetingId, reserva]);
  
    // 2. POLLING PARA ESTADO DE SALA
    useEffect(() => {
      const checkWaitingRoomStatus = async () => {
        try {
          const { data } = await api.get(`/meeting/${meetingId}/waiting-room-status`);
          setWaitingRoomStatus(data);
        } catch (error) {
          console.error('Error verificando estado de sala:', error);
        }
      };
  
      if (reserva && !meetingStarted) {
        const interval = setInterval(checkWaitingRoomStatus, 3000);
        return () => clearInterval(interval);
      }
    }, [meetingId, reserva, meetingStarted]);

    const initializeWebRTC = () => {
      const currentUserId = isInstructor ? reserva.instructor_id : reserva.alumno_id;
      const otherUserId   = isInstructor ? reserva.alumno_id     : reserva.instructor_id;
    
      if (!currentUserId || !otherUserId) {
        alert('Error: IDs de usuario no disponibles. Recarga la página.');
        return;
      }
    
      window.location.href =
        `/webrtc?meeting_id=${meetingId}` +
        `&current_user_id=${currentUserId}` +
        `&other_user_id=${otherUserId}`;
    }
  // 3. POLLING PARA ALUMNO
  useEffect(() => {


    if (!isInstructor && !meetingStarted && reserva) {
      console.log('🔄 Iniciando polling para alumno...');
      
      const interval = setInterval(async () => {
        try {
          const { data } = await api.get(`/meeting/${meetingId}/status`);
          console.log('📡 Status check:', data);
          
          if (data.started || data.estado  === 'en_curso' ) {
            console.log('✅ Reunión iniciada! Redirigiendo alumno...');
            setMeetingStarted(true);
            initializeWebRTC(reserva, isInstructor);
            clearInterval(interval);
            console.log(data);
          }
        } catch (error) {
          console.error('❌ Error checking meeting status:', error);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isInstructor, meetingStarted, meetingId, reserva]);

  

  async function startMeeting() {
    try {

      // Verificar que ambos estén conectados
      if(isInstructor && !waitingRoomStatus.both_connected){
        alert('Esperando a que los alumnos se conecten...');
        return;
      }

      await api.post(`/meeting/${meetingId}/start`);
      setMeetingStarted(true);
      initializeWebRTC(reserva, isInstructor);
    } catch (error) {
      console.error('Error starting meeting:', error);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('Enlace copiado al portapapeles!');
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
                  Estado: {
                    waitingRoomStatus.both_connected ?  
                    <span className="text-green-600">Conectados</span>
                    : <span className="text-orange-600">Esperando...</span>  
                  }
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 mb-6">
              {isInstructor ? (
                <button
                  onClick={startMeeting}
                  disabled={!waitingRoomStatus.both_connected}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                  waitingRoomStatus.both_connected
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}>
                  {waitingRoomStatus.both_connected ? '🎬 Iniciar Reunión' : '⏳ Esperando al alumno...'}
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

            {/* Mensajes con estado de conexión */}
            {!isInstructor && (
              <div className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg">
                {waitingRoomStatus.both_connected 
                  ? '✅ Ambos conectados - Esperando que el instructor inicie...' 
                  : '⏳ Esperando que el instructor se conecte...'}
              </div>
            )}

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