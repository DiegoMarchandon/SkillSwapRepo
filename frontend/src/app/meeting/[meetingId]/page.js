// app/meeting/[meetingId]/page.js
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../utils/axios';
import SpriteCloudSky from '../../../components/background/SpriteCloudSky';

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
    <div className="min-h-screen relative">
      <SpriteCloudSky />
      
      {/* Sala de espera */}
      {!meetingStarted && (
        <div className="max-w-6xl mx-auto p-6 z-30 relative">
          {/* Contenedor principal con estilo pixel art */}
          <div className="bg-gray-800 border-4 border-gray-700 backdrop-blur-sm bg-opacity-90 p-8"
               style={{ boxShadow: '8px 8px 0 #000' }}>
            
            {/* Título principal */}
            <h1 className="text-4xl font-bold text-center text-white mb-8 font-mono pixel-text"
                style={{ 
                  fontFamily: 'VT323, monospace',
                  textShadow: '2px 2px 0 #000, 4px 4px 0 rgba(103, 232, 249, 0.3)',
                  letterSpacing: '2px'
                }}>
              🕐 SALA DE ESPERA
            </h1>
            
            {/* Información de usuarios - REDISEÑADO */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Usuario actual */}
              <div className={`p-6 rounded-none border-4 font-mono ${
                isInstructor 
                  ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' 
                  : 'bg-green-900/50 border-green-500 text-green-300'
              }`}
              style={{ boxShadow: '4px 4px 0 #000' }}>
                <h3 className="font-bold text-xl mb-3">
                  TÚ ({isInstructor ? 'INSTRUCTOR' : 'ALUMNO'})
                </h3>
                <p className="text-lg">
                  {reserva.current_user.name}
                </p>
                <p className="text-sm opacity-80">
                  {reserva.current_user.email}
                </p>
              </div>

              {/* Otro usuario */}
              <div className={`p-6 rounded-none border-4 font-mono ${
                !isInstructor 
                  ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' 
                  : 'bg-green-900/50 border-green-500 text-green-300'
              }`}
              style={{ boxShadow: '4px 4px 0 #000' }}>
                <h3 className="font-bold text-xl mb-3">
                  {isInstructor ? 'ALUMNO' : 'INSTRUCTOR'}
                </h3>
                <p className="text-lg">
                  {reserva.other_user.name}
                </p>
                <p className="text-sm opacity-80">
                  {reserva.other_user.email}
                </p>
                <p className="text-lg mt-3 font-bold">
                  ESTADO: {
                    waitingRoomStatus.both_connected ?  
                    <span className="text-green-400">CONECTADOS</span>
                    : <span className="text-yellow-400">ESPERANDO...</span>  
                  }
                </p>
              </div>
            </div>

            {/* Botones de acción - REDISEÑADO */}
            <div className="flex gap-4 mb-8 justify-center">
              {isInstructor ? (
                <button
                  onClick={startMeeting}
                  disabled={!waitingRoomStatus.both_connected}
                  className={`px-8 py-4 rounded-none border-4 font-mono text-xl font-bold transition ${
                    waitingRoomStatus.both_connected
                    ? 'bg-cyan-500 text-gray-900 border-cyan-700 hover:bg-cyan-400'
                    : 'bg-gray-600 text-gray-400 border-gray-700 cursor-not-allowed'
                  }`}
                  style={{ boxShadow: waitingRoomStatus.both_connected ? '4px 4px 0 #000' : 'none' }}>
                  {waitingRoomStatus.both_connected ? '🎬 INICIAR REUNIÓN' : '⏳ ESPERANDO AL ALUMNO...'}
                </button>
              ) : (
                <div className="px-8 py-4 bg-gray-700 text-gray-300 border-4 border-gray-600 rounded-none font-mono text-xl text-center"
                     style={{ boxShadow: '4px 4px 0 #000' }}>
                  ESPERANDO QUE EL INSTRUCTOR INICIE LA REUNIÓN...
                </div>
              )}
              
              <button
                onClick={copyLink}
                className="px-8 py-4 bg-gray-600 text-white border-4 border-gray-700 rounded-none hover:bg-gray-500 transition font-mono text-xl font-bold"
                style={{ boxShadow: '4px 4px 0 #000' }}
              >
                📋 COPIAR ENLACE
              </button>
            </div>

            {/* Mensajes con estado de conexión - REDISEÑADO */}
            {!isInstructor && (
              <div className={`px-6 py-4 rounded-none border-4 font-mono text-lg text-center mb-6 ${
                waitingRoomStatus.both_connected 
                  ? 'bg-green-900/50 border-green-500 text-green-300' 
                  : 'bg-yellow-900/50 border-yellow-500 text-yellow-300'
              }`}
              style={{ boxShadow: '4px 4px 0 #000' }}>
                {waitingRoomStatus.both_connected 
                  ? '✅ AMBOS CONECTADOS - ESPERANDO QUE EL INSTRUCTOR INICIE...' 
                  : '⏳ ESPERANDO QUE EL INSTRUCTOR SE CONECTE...'}
              </div>
            )}

            {/* Información de la reunión - REDISEÑADO */}
            <div className="bg-gray-700/80 border-4 border-gray-600 rounded-none p-6 backdrop-blur-sm"
                 style={{ boxShadow: '6px 6px 0 #000' }}>
              <h3 className="font-bold text-2xl text-white mb-4 font-mono text-center">
                INFORMACIÓN DE LA REUNIÓN
              </h3>
              <div className="space-y-4 font-mono text-lg">
                <p className="text-cyan-300">
                  <strong className="text-white">ID:</strong> {meetingId}
                </p>
                <div>
                  <strong className="text-white block mb-2">ENLACE:</strong>
                  <input 
                    type="text" 
                    value={window.location.href} 
                    readOnly 
                    className="w-full px-4 py-3 bg-gray-600 text-white border-4 border-gray-800 rounded-none font-mono"
                    style={{ boxShadow: '3px 3px 0 #000' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Videollamada - REDISEÑADO */}
      {meetingStarted && (
        <div className="max-w-6xl mx-auto p-6 z-30 relative">
          <div className="bg-gray-800 border-4 border-gray-700 backdrop-blur-sm bg-opacity-90 p-8"
               style={{ boxShadow: '8px 8px 0 #000' }}>
            
            <h1 className="text-4xl font-bold text-center text-white mb-8 font-mono pixel-text"
                style={{ 
                  fontFamily: 'VT323, monospace',
                  textShadow: '2px 2px 0 #000, 4px 4px 0 rgba(103, 232, 249, 0.3)',
                  letterSpacing: '2px'
                }}>
              🎥 REUNIÓN EN CURSO
            </h1>
            
            {/* Componente WebRTC */}
            <div className="border-4 border-gray-600 bg-gray-700/50 rounded-none p-8 text-center backdrop-blur-sm"
                 style={{ boxShadow: '6px 6px 0 #000' }}>
              <p className="text-gray-300 mb-6 font-mono text-xl">
                COMPONENTE WEBRTC SE CARGARÁ AQUÍ...
              </p>
              
              <button 
                onClick={initializeWebRTC}
                className="px-8 py-4 bg-green-500 text-gray-900 border-4 border-green-700 rounded-none hover:bg-green-400 transition font-mono text-xl font-bold"
                style={{ boxShadow: '4px 4px 0 #000' }}
              >
                INICIALIZAR VIDEOCALL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}