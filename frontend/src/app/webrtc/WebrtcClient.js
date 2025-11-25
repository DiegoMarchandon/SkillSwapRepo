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
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'turn:localhost:3478', username: 'admin', credential: '12345' },
        ],
      });

      // Configurar event handlers
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

      // Añadir tracks locales solo si existen
      if (stream) {
        stream.getTracks().forEach(track => {
          pcRef.current.addTrack(track, stream);
        });
      }

      // Crear y enviar offer
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      
      socketRef.current.emit('offer', { 
        offer, 
        call_id: callId 
      });

      startCollecting();
      console.log('✅ Call started successfully as caller');

    } catch (error) {
      console.error('❌ Error starting call as caller:', error);
      setCallStarted(false);
      setIsCaller(false);
    }
  }, [otherUserId, usuarioHabilidadId, startCall, getLocalMedia, startCollecting, callStarted]);

  // Handler para offer (receiver)
  const handleOffer = useCallback(async ({ offer, call_id }) => {
    // Solo procesar offer si NO somos el caller
    if (callStarted || otherUserId) {
      console.log('Ignoring offer: already call started or we are the caller');
      return;
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
  
      // Configurar event handlers
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
  
      // Añadir tracks locales solo si existen
      if (stream) {
        stream.getTracks().forEach(track => {
          pcRef.current.addTrack(track, stream);
        });
      }
  
      // Procesar offer y crear answer
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      
      socketRef.current.emit('answer', { answer, call_id });
      startCollecting();
      
      console.log('✅ Receiver ready');
  
    } catch (error) {
      console.error('❌ Error handling offer as receiver:', error);
      setCallStarted(false);
      setIsCaller(false);
    }
  }, [getLocalMedia, startCollecting, callStarted, otherUserId]);

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

    socketRef.current = io('http://localhost:4000');

    // Determinar quién es el caller basado en el usuario actual
    // El caller es el que tiene otherUserId (inicia la llamada)
    const isCurrentUserCaller = !!otherUserId;

    // Configurar event listeners
    socketRef.current.on('offer', handleOffer);
    
    // Handler para answer (caller)
  socketRef.current.on('answer', async ({ answer }) => {
    if (!pcRef.current) {
      console.warn('No PeerConnection for answer');
      return;
    }
    
    // Solo procesar answer si somos el caller y estamos en estado correcto
    if (pcRef.current.signalingState !== 'have-local-offer') {
      console.warn('Ignoring answer: wrong state', pcRef.current.signalingState);
      return;
    }
      
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('✅ Answer set successfully');
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    // Handler para ICE candidates
  socketRef.current.on('ice-candidate', async (candidate) => {
    if (!pcRef.current) {
      console.warn('ICE candidate ignored: no PeerConnection');
      return;
    }
    
    // Esperar a tener remoteDescription antes de agregar ICE candidates
    if (!pcRef.current.remoteDescription) {
      console.log('🕒 ICE candidate queued - waiting for remote description');
      // Podemos guardar el candidate y agregarlo después
      return;
    }
      
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    // Handler para fin de llamada
    socketRef.current.on('end-call', ({ meetingId: endedMeetingId }) => {
      if (endedMeetingId !== meetingId) return;
      endCall();
    });

    // Iniciar como caller SOLO si tenemos otherUserId
  if (isCurrentUserCaller && !callStarted) {
    console.log('🎯 This user is the caller, starting call...');
    const timer = setTimeout(() => {
      startCallAsCaller();
    }, 2000);

    return () => clearTimeout(timer);
  } else if (!isCurrentUserCaller) {
    console.log('🎯 This user is the receiver, waiting for offer...');
    setIsCaller(false);
  }

    // Cleanup
    return () => {
      if (!callStarted) {
        // Solo cleanup si no hay llamada en curso
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [meetingId, otherUserId, callStarted, startCallAsCaller, handleOffer, endCall]);

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
          {/* Rol: {isCaller ? 'Caller' : 'Receiver'} */}
        </span>
      </div>
    </div>
  );
}
