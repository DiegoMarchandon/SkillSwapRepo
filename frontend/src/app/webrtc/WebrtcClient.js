'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import useStartCall from '../../hooks/useStarCall';
import { useSearchParams } from 'next/navigation';

export default function WebrtcClient() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const metricsRef = useRef([]);
  const localStreamRef = useRef(null);
  
  const [isCaller, setIsCaller] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  const { user } = useAuth();
  const { startCall } = useStartCall();

  const search = useSearchParams();
  const meetingId = search.get('meeting_id');
  const otherUserId = search.get('other_user_id');
  const usuarioHabilidadId = search.get('usuario_habilidad_id');

  // ---- Métricas WebRTC (definir PRIMERO) ----
  const collectStats = useCallback(async () => {
    if (!pcRef.current) return;
    try {
      const stats = await pcRef.current.getStats();
      stats.forEach(report => {
        if (report.type === 'outbound-rtp' && report.kind === 'video') {
          metricsRef.current.push({
            timestamp: report.timestamp,
            bytesSent: report.bytesSent,
            framesPerSecond: report.framesPerSecond,
            packetsSent: report.packetsSent,
            roundTripTime: report.roundTripTime,
          });
        }
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          metricsRef.current.push({
            timestamp: report.timestamp,
            bytesReceived: report.bytesReceived,
            packetsLost: report.packetsLost,
            jitter: report.jitter,
          });
        }
      });
    } catch (error) {
      console.warn('Error collecting stats:', error);
    }
  }, []);

  const startCollecting = useCallback(() => {
    if (!statsIntervalRef.current) {
      statsIntervalRef.current = setInterval(collectStats, 5000);
    }
  }, [collectStats]);

  const stopCollecting = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  }, []);

  // ---- Estrategia para testing local ----
  const getLocalMedia = useCallback(async (retryCount = 0) => {
    try {
      // Limpiar stream anterior si existe
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      
      console.log('📹 Dispositivos de video disponibles:', videoDevices.map(d => d.label));

      let constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: true
      };

      // ESTRATEGIA 1: Intentar con dispositivos específicos
      if (videoDevices.length > 1) {
        // Si hay múltiples cámaras, usar estrategias diferentes para caller vs receiver
        if (isCaller) {
          // Caller: preferir cámara frontal/integrada
          const frontCamera = videoDevices.find(d => 
            d.label.toLowerCase().includes('front') ||
            d.label.toLowerCase().includes('integrated') ||
            d.label.toLowerCase().includes('face')
          );
          if (frontCamera) {
            constraints.video.deviceId = { exact: frontCamera.deviceId };
          }
        } else {
          // Receiver: preferir cámara trasera o diferente
          const backCamera = videoDevices.find(d => 
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('external') ||
            (!d.label.toLowerCase().includes('front') && 
             !d.label.toLowerCase().includes('integrated') &&
             !d.label.toLowerCase().includes('face'))
          );
          if (backCamera) {
            constraints.video.deviceId = { exact: backCamera.deviceId };
          }
        }
      }

      console.log('🎯 Intentando con constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setMediaError(null);
      return stream;

    } catch (error) {
      console.error(`❌ Error obteniendo media (intento ${retryCount + 1}):`, error);
      
      // ESTRATEGIA 2: Fallback - intentar solo audio
      if (retryCount === 0) {
        console.log('🔄 Intentando fallback: solo audio');
        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ 
            video: false, 
            audio: true 
          });
          
          localStreamRef.current = audioOnlyStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = audioOnlyStream;
          }
          
          setMediaError('Solo audio disponible - cámara en uso');
          return audioOnlyStream;
        } catch (audioError) {
          console.error('❌ Fallback de audio también falló:', audioError);
        }
      }

      // ESTRATEGIA 3: Usar video sin deviceId específico (dejar que el navegador decida)
      if (retryCount === 1) {
        console.log('🔄 Intentando con video genérico');
        try {
          const genericStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          
          localStreamRef.current = genericStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = genericStream;
          }
          
          setMediaError(null);
          return genericStream;
        } catch (genericError) {
          console.error('❌ Video genérico también falló:', genericError);
        }
      }

      setMediaError(`No se pudo acceder a la cámara: ${error.message}`);
      throw error;
    }
  }, [isCaller]);

  // ---- Funciones de llamada ----
  const startCallAsCaller = useCallback(async () => {
    if (callStarted) return;
    
    try {
      console.log('🚀 Starting call as caller - User is caller:', !!otherUserId);
      setCallStarted(true);
      setIsCaller(true);
  
      const callId = await startCall(otherUserId, usuarioHabilidadId);
      localStorage.setItem('call_id', callId);
  
      // Obtener media local con reintentos
      const stream = await getLocalMedia();
      
      // Crear nueva PeerConnection
      pcRef.current = new RTCPeerConnection({
        iceServers: [
          // STUN públicos
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          // Si necesitás TURN (para redes restrictivas)
          // { urls: 'turn:relay1.expressturn.com:3478', username: 'efCfyjWjXazSGDvRVM', credential: 'rQqvBvWfFD7Z9UcC' }
        ],
      });
  
      // Configurar event handlers CON MÁS LOGGING
      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('📤 Sending ICE candidate from caller');
          socketRef.current.emit('ice-candidate', event.candidate);
        }
      };
  
      pcRef.current.ontrack = (event) => {
        console.log('🎬 Caller received remote track:', event.track.kind);
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          console.log('✅ Caller remote video stream set successfully');
        }
      };
  
      // Añadir tracks locales solo si existen
      if (stream) {
        stream.getTracks().forEach(track => {
          console.log('📹 Caller adding local track:', track.kind);
          pcRef.current.addTrack(track, stream);
        });
      }
  
      // Crear y enviar offer
      console.log('🔄 Creating offer');
      const offer = await pcRef.current.createOffer();
      
      console.log('🔄 Setting local description (offer)');
      await pcRef.current.setLocalDescription(offer);
      
      console.log('📤 Sending offer to receiver');
      socketRef.current.emit('offer', { 
        offer, 
        call_id: callId 
      });
  
      startCollecting();
      console.log('✅ Caller ready and waiting for answer');
  
    } catch (error) {
      console.error('❌ Error starting call as caller:', error);
      setCallStarted(false);
      setIsCaller(false);
    }
  }, [otherUserId, usuarioHabilidadId, startCall, getLocalMedia, startCollecting, callStarted]);

  // Handler para offer (receiver)
  // Handler para offer (receiver) - MÁS PERMISIVO
const handleOffer = useCallback(async ({ offer, call_id }) => {
  // Lógica MEJORADA: Solo ignorar si YA somos caller activo
  if (callStarted && isCaller) {
    console.log('Ignoring offer: we are already the active caller');
    return;
  }
  
  // Si ya tenemos una PC pero no somos caller, limpiarla
  if (pcRef.current && !isCaller) {
    console.log('🔄 Cleaning existing PeerConnection for new offer');
    pcRef.current.close();
    pcRef.current = null;
  }
  
  console.log('📞 Received offer, acting as receiver');
  setCallStarted(true);
  setIsCaller(false);
  localStorage.setItem('call_id', call_id);

  try {
    // Obtener media local con reintentos
    const stream = await getLocalMedia();
    
    // Crear nueva PeerConnection para receiver
    pcRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:localhost:3478', username: 'admin', credential: '12345' },
      ],
    });

    // Configurar event handlers CON MÁS LOGGING
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('📤 Sending ICE candidate');
        socketRef.current.emit('ice-candidate', event.candidate);
      }
    };

    pcRef.current.ontrack = (event) => {
      console.log('🎬 Received remote track:', event.track.kind);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        console.log('✅ Remote video stream set successfully');
      }
    };

    // Añadir tracks locales solo si existen
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('📹 Adding local track:', track.kind);
        pcRef.current.addTrack(track, stream);
      });
    }

    // Procesar offer y crear answer CON MÁS LOGGING
    console.log('🔄 Setting remote description (offer)');
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    
    console.log('🔄 Creating answer');
    const answer = await pcRef.current.createAnswer();
    
    console.log('🔄 Setting local description (answer)');
    await pcRef.current.setLocalDescription(answer);
    
    console.log('📤 Sending answer to caller');
    socketRef.current.emit('answer', { answer, call_id });
    
    startCollecting();
    
    console.log('✅ Receiver ready and connected');

  } catch (error) {
    console.error('❌ Error handling offer as receiver:', error);
    setCallStarted(false);
    setIsCaller(false);
  }
}, [getLocalMedia, startCollecting, callStarted, isCaller]);

  // ---- Terminar llamada ----
  const endCall = useCallback(async () => {
    try {
      await api.post(`/meeting/${meetingId}/end`);
      socketRef.current?.emit('end-call', { meetingId });
    } catch (error) {
      console.error('Error ending meeting:', error);
    }

    // Limpiar todo
    stopCollecting();
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setCallStarted(false);
    setIsCaller(false);
    
    window.location.href = '/';
  }, [meetingId, stopCollecting]);

  // ---- useEffect principal ----
  useEffect(() => {
    if (!meetingId) return;
  
    // 👇 Evita conexiones duplicadas (IMPORTANTE)
    if (socketRef.current) {
      console.log('⚠️ Socket ya inicializado, no creo otro');
      return;
    }
  
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://skillswap-signaling.onrender.com';
  
    console.log('🔌 Conectando a socket:', socketUrl);
  
    socketRef.current = io(socketUrl, {
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });
  
    socketRef.current.on('connect', () => {
      console.log('✅ Socket conectado exitosamente');
    });
  
    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Error de conexión socket:', error.message);
    });
  
    // --- HANDLERS DEFINIDOS DENTRO para no depender de useCallbacks ---
    
    // Handler de offer
    const handleOfferInternal = async ({ offer, call_id }) => {
      if (callStarted || otherUserId) {
        console.log('Ignoring offer: already call started or we are the caller');
        return;
      }
      
      console.log('📞 Received offer, acting as receiver');
      setCallStarted(true);
      setIsCaller(false);
      localStorage.setItem('call_id', call_id);
  
      try {
        const stream = await getLocalMedia();
        
        pcRef.current = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        });
  
        pcRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit('ice-candidate', event.candidate);
          }
        };
  
        pcRef.current.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
  
        if (stream) {
          stream.getTracks().forEach(track => {
            pcRef.current.addTrack(track, stream);
          });
        }
  
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        
        socketRef.current.emit('answer', { answer, call_id });
        startCollecting();
        
        console.log('✅ Receiver ready');
  
      } catch (error) {
        console.error('❌ Error handling offer:', error);
        setCallStarted(false);
        setIsCaller(false);
      }
    };
  
    // Handler de answer
    const handleAnswerInternal = async ({ answer }) => {
      const pc = pcRef.current;
      if (!pc) {
        console.warn('No PeerConnection for answer');
        return;
      }
  
      console.log('📨 Received answer, current state:', pc.signalingState);
  
      if (pc.signalingState !== 'have-local-offer') {
        console.warn('Ignoring answer because signalingState is', pc.signalingState);
        return;
      }
  
      if (pc.remoteDescription) {
        console.warn('Ignoring answer because remoteDescription already set');
        return;
      }
  
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('✅ Answer set successfully');
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    };
  
    // Handler de ICE
    const handleIceCandidateInternal = async (candidate) => {
      if (!pcRef.current) {
        return; // Silencioso
      }
  
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        // Silencioso
      }
    };
  
    // Handler de end-call
    const handleEndCallInternal = ({ meetingId: endedMeetingId }) => {
      if (endedMeetingId !== meetingId) return;
      
      // Usar la función endCall directamente
      if (socketRef.current) socketRef.current.disconnect();
      if (pcRef.current) pcRef.current.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      stopCollecting();
      setCallStarted(false);
      setIsCaller(false);
      window.location.href = '/';
    };
  
    // Asignar handlers
    socketRef.current.on('offer', handleOfferInternal);
    socketRef.current.on('answer', handleAnswerInternal);
    socketRef.current.on('ice-candidate', handleIceCandidateInternal);
    socketRef.current.on('end-call', handleEndCallInternal);
  
    // Determinar rol
    const isCurrentUserCaller = !!otherUserId;
    console.log('🎭 Role determination:', {
      otherUserId: !!otherUserId,
      isCurrentUserCaller,
    });
  
    let callTimer = null;
  
    if (isCurrentUserCaller) {
      console.log('🎯 This user is the CALLER, starting in 3s...');
      setIsCaller(true);
      
      // Función interna para iniciar llamada
      const startCallInternal = async () => {
        if (callStarted) return;
        
        try {
          console.log('🚀 Starting call as caller');
          setCallStarted(true);
  
          const callId = await startCall(otherUserId, usuarioHabilidadId);
          localStorage.setItem('call_id', callId);
  
          const stream = await getLocalMedia();
          
          pcRef.current = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
            ],
          });
  
          pcRef.current.onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit('ice-candidate', event.candidate);
            }
          };
  
          pcRef.current.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          };
  
          if (stream) {
            stream.getTracks().forEach(track => {
              pcRef.current.addTrack(track, stream);
            });
          }
  
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
          
          socketRef.current.emit('offer', { offer, call_id: callId });
          startCollecting();
          
          console.log('✅ Caller ready');
  
        } catch (error) {
          console.error('❌ Error starting call:', error);
          setCallStarted(false);
          setIsCaller(false);
        }
      };
  
      callTimer = setTimeout(startCallInternal, 3000);
    } else {
      console.log('🎯 This user is the RECEIVER, waiting for offer...');
      setIsCaller(false);
    }
  
    // 🧹 Cleanup ÚNICO - solo al desmontar
    return () => {
      console.log('🧹 Cleanup socket effect (unmounting)');
      
      if (callTimer) clearTimeout(callTimer);
      
      // NO limpiar socketRef.current aquí si queremos reusarlo
      // Solo limpiar si realmente el componente se desmonta
    };
  
  // 🔴 DEPENDENCIAS MÍNIMAS: solo meetingId
  }, [meetingId]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">
        Videollamada WebRTC - {isCaller ? 'Caller' : 'Receiver'}
      </h1>
      
      {mediaError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {mediaError}
        </div>
      )}

      {/* Agregar este nuevo elemento */}
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        {isCaller ? 
          '💚 Eres el iniciador de la llamada (Caller)' : 
          '💙 Esperando llamada entrante (Receiver)'}
        {callStarted && ' - ✅ Conectado'}
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <h3 className="text-sm font-medium mb-2">Tu cámara (local)</h3>
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full border rounded"
          />
          {!localVideoRef.current?.srcObject && (
            <div className="text-gray-500 text-sm mt-2">
              Esperando acceso a cámara...
            </div>
          )}
        </div>
        <div className="w-1/2">
          <h3 className="text-sm font-medium mb-2">Cámara remota</h3>
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full border rounded"
          />
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        <button
          onClick={endCall}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Terminar llamada
        </button>
        <span className="text-sm text-gray-600">
          Estado: {callStarted ? 'Conectado' : 'Conectando...'} | 
          Rol: {isCaller ? 'Caller' : 'Receiver'}
        </span>
      </div>
    </div>
  );
}
