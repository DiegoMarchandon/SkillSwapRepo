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
  const localStreamRef = useRef(null);

  // para asegurar que no se arranque más de una vez
  const callerStartedRef = useRef(false);
  const receiverStartedRef = useRef(false);

  const [isCaller, setIsCaller] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  const { user } = useAuth();
  const { startCall } = useStartCall();

  const search = useSearchParams();
  const meetingId = search.get('meeting_id');
  const otherUserId = search.get('other_user_id');
  const usuarioHabilidadId = search.get('usuario_habilidad_id');
  const forceCaller = search.get('forceCaller'); // <-- NUEVO

  // =============== MEDIA LOCAL SIMPLE ===============
  const getLocalMedia = useCallback(
    async () => {
      try {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => t.stop());
        }

        const constraints = {
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        };

        console.log('🎯 getUserMedia con constraints:', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setMediaError(null);
        return stream;
      } catch (err) {
        console.error('❌ Error obteniendo media:', err);

        try {
          console.log('🔄 Fallback solo audio');
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          localStreamRef.current = audioStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = audioStream;
          }
          setMediaError('Solo audio disponible');
          return audioStream;
        } catch (err2) {
          console.error('❌ Fallback audio también falló:', err2);
          setMediaError(`No se pudo acceder a la cámara/micrófono: ${err.message}`);
          throw err;
        }
      }
    },
    []
  );

  // =============== CLEANUP ===============
  const cleanup = useCallback(() => {
    console.log('🧹 Cleanup call');

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    callerStartedRef.current = false;
    receiverStartedRef.current = false;
    setCallStarted(false);
    setIsCaller(false);
  }, []);

  // =============== BOTÓN TERMINAR ===============
  const endCall = useCallback(
    async () => {
      try {
        if (meetingId) {
          await api.post(`/meeting/${meetingId}/end`);
        }
        socketRef.current?.emit('end-call', { meetingId });
      } catch (e) {
        console.error('Error ending meeting:', e);
      }
      cleanup();
      window.location.href = '/';
    },
    [meetingId, cleanup]
  );

  // =============== EFFECT PRINCIPAL ===============
  useEffect(() => {
    if (!meetingId) return;

    // evitar re-inicializar si por algún motivo React vuelve a montar
    if (socketRef.current) {
      console.log('⚠️ WebRTC ya inicializado, omito nueva conexión');
      return;
    }

    console.log('🟢 Inicializando WebRTC, meeting:', meetingId);

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      'https://skillswap-signaling.onrender.com';

    console.log('🔌 Conectando a socket:', socketUrl);

    const socket = io(socketUrl, {
      timeout: 15000,
      transports: ['websocket', 'polling'],
      reconnection: false, // ⛔ nada de reconectar en loop
    });

    socketRef.current = socket;

    // logs básicos
    socket.on('connect', () => {
      console.log('✅ Socket conectado, ID:', socket.id);
      socket.emit('join', { meetingId });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ connect_error:', err.message);
    });

    // ========== HANDLERS SEÑALIZACIÓN ==========
    const handleOffer = async ({ offer, call_id, meetingId: incomingMeeting }) => {
      if (incomingMeeting && incomingMeeting !== meetingId) return;

      console.log('📞 OFFER RECIBIDA');

      // solo el receiver maneja la offer
      if (otherUserId) {
        console.log('Soy caller, ignoro offer');
        return;
      }

      if (receiverStartedRef.current) {
        console.log('Receiver ya está inicializado, ignoro nueva offer');
        return;
      }
      receiverStartedRef.current = true;

      setCallStarted(true);
      setIsCaller(false);
      localStorage.setItem('call_id', call_id);

      try {
        const stream = await getLocalMedia();

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        pcRef.current = pc;

        if (stream) {
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        }

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            console.log('📤 ICE (receiver)');
            socket.emit('ice-candidate', {
              candidate: e.candidate,
              meetingId,
            });
          }
        };

        pc.ontrack = (e) => {
          console.log('🎬 Receiver ontrack:', e.track.kind);
          if (remoteVideoRef.current && e.streams[0]) {
            remoteVideoRef.current.srcObject = e.streams[0];
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log('📤 Enviando answer');
        socket.emit('answer', { answer, call_id, meetingId });
      } catch (err) {
        console.error('❌ Error en receiver:', err);
      }
    };

    const handleAnswer = async ({ answer, meetingId: incomingMeeting }) => {
      if (incomingMeeting && incomingMeeting !== meetingId) return;

      const pc = pcRef.current;
      if (!pc) return;

      console.log('📨 ANSWER recibida, state:', pc.signalingState);

      if (pc.remoteDescription) {
        console.log('RemoteDescription ya seteada, ignoro');
        return;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('✅ Answer aplicada');
      } catch (err) {
        console.error('❌ Error aplicando answer:', err);
      }
    };

    const handleIceCandidate = async ({ candidate, meetingId: incomingMeeting }) => {
      if (incomingMeeting && incomingMeeting !== meetingId) return;
      const pc = pcRef.current;
      if (!pc || !candidate) return;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.log('ICE add error (no grave):', err.message);
      }
    };

    const handleEndCall = ({ meetingId: ended }) => {
      if (ended && ended !== meetingId) return;
      console.log('📴 end-call recibido');
      cleanup();
      window.location.href = '/';
    };

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('end-call', handleEndCall);

    // ========== ARRANCAR CALLER ==========
    // ========== NUEVA LÓGICA DE ROLES ==========
    const determineRole = () => {
      // 1. Forzar rol si viene en URL (para testing)
      if (forceCaller === 'true') return true;
      if (forceCaller === 'false') return false;
      
      // 2. Comparar IDs si ambos están disponibles
      const currentUserId = user?.id;
      const otherUserIdNum = parseInt(otherUserId);
      
      if (currentUserId && otherUserIdNum) {
        // El usuario con ID MENOR es el caller
        const isCallerByComparison = currentUserId < otherUserIdNum;
        console.log('🔍 Comparación de IDs:', {
          currentUserId,
          otherUserId: otherUserIdNum,
          isCallerByComparison
        });
        return isCallerByComparison;
      }
      
      // 3. Fallback a la lógica original
      const fallbackIsCaller = !!otherUserId;
      console.log('🔄 Fallback a lógica original:', { otherUserId, fallbackIsCaller });
      return fallbackIsCaller;
    };

    const isCurrentUserCaller = determineRole();
    console.log('🎭 Role:', isCurrentUserCaller ? 'CALLER' : 'RECEIVER', {
      userId: user?.id,
      otherUserId,
      forceCaller
    });
    setIsCaller(isCurrentUserCaller);

    let callTimer = null;

    if (isCurrentUserCaller) {
      callTimer = setTimeout(async () => {
        if (callerStartedRef.current) {
          console.log('Caller ya iniciado, no repito');
          return;
        }
        callerStartedRef.current = true;

        try {
          console.log('🚀 Iniciando llamada como caller');
          setCallStarted(true);

          const callId = await startCall(otherUserId, usuarioHabilidadId);
          localStorage.setItem('call_id', callId);

          const stream = await getLocalMedia();

          const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          });
          pcRef.current = pc;

          if (stream) {
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
          }

          pc.onicecandidate = (e) => {
            if (e.candidate && socket.connected) {
              console.log('📤 ICE (caller)');
              socket.emit('ice-candidate', {
                candidate: e.candidate,
                meetingId,
              });
            }
          };

          pc.ontrack = (e) => {
            console.log('🎬 Caller ontrack:', e.track.kind);
            if (remoteVideoRef.current && e.streams[0]) {
              remoteVideoRef.current.srcObject = e.streams[0];
            }
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          console.log('📤 Enviando offer');
          socket.emit('offer', { offer, call_id: callId, meetingId });
        } catch (err) {
          console.error('❌ Error iniciando llamada (caller):', err);
          callerStartedRef.current = false;
          setCallStarted(false);
        }
      }, 3000);
    }

    // ========== CLEANUP EFFECT ==========
    return () => {
      console.log('🧹 Cleanup effect WebRTC');
      if (callTimer) clearTimeout(callTimer);

      if (socketRef.current) {
        socketRef.current.off('offer', handleOffer);
        socketRef.current.off('answer', handleAnswer);
        socketRef.current.off('ice-candidate', handleIceCandidate);
        socketRef.current.off('end-call', handleEndCall);
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      callerStartedRef.current = false;
      receiverStartedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, otherUserId, usuarioHabilidadId]);

  // =============== RENDER ===============
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

      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        ✅ Conexión WebRTC – {callStarted ? 'Conectado' : 'Conectando...'}
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <h3 className="text-sm font-medium mb-2">Tu cámara (local)</h3>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full border-2 border-green-500 rounded-lg"
            style={{ minHeight: '300px', backgroundColor: '#f0f0f0' }}
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
            className="w-full border-2 border-blue-500 rounded-lg"
            style={{ minHeight: '300px', backgroundColor: '#000' }}
            onCanPlay={() => {
              console.log('🎬 Remote video can play, intento play()');
              remoteVideoRef.current
                ?.play()
                .catch((e) => console.log('⚠️ Auto-play bloqueado:', e.message));
            }}
            onPlaying={() => console.log('▶️ Remote video PLAYING')}
          />
          {remoteVideoRef.current?.srcObject ? (
            <div className="text-green-600 text-sm mt-2">
              ✅ Recibiendo video remoto
            </div>
          ) : (
            <div className="text-gray-500 text-sm mt-2">
              Esperando video remoto...
            </div>
          )}
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
          Estado: {callStarted ? '✅ Conectado' : '⏳ Conectando...'} | Rol:{' '}
          {isCaller ? '🎤 Caller' : '🎧 Receiver'}
        </span>
      </div>
    </div>
  );
}
