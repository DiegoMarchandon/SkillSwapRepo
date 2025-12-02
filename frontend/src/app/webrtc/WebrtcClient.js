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

  // ===================== MÉTRICAS =====================
  const collectStats = useCallback(async () => {
    if (!pcRef.current) return;
    try {
      const stats = await pcRef.current.getStats();
      stats.forEach((report) => {
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

  // ===================== MEDIA LOCAL =====================
  const getLocalMedia = useCallback(
    async (retryCount = 0) => {
      try {
        // Limpiar stream anterior si existe
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');

        console.log(
          '📹 Dispositivos de video disponibles:',
          videoDevices.map((d) => d.label)
        );

        let constraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: true,
        };

        // Caller vs receiver intentan cámaras distintas si hay varias
        if (videoDevices.length > 1) {
          if (isCaller) {
            const frontCamera = videoDevices.find(
              (d) =>
                d.label.toLowerCase().includes('front') ||
                d.label.toLowerCase().includes('integrated') ||
                d.label.toLowerCase().includes('face')
            );
            if (frontCamera) {
              constraints.video.deviceId = { exact: frontCamera.deviceId };
            }
          } else {
            const backCamera = videoDevices.find(
              (d) =>
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
        console.error(
          `❌ Error obteniendo media (intento ${retryCount + 1}):`,
          error
        );

        // Fallback 1: solo audio
        if (retryCount === 0) {
          console.log('🔄 Intentando fallback: solo audio');
          try {
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true,
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

        // Fallback 2: video genérico
        if (retryCount === 1) {
          console.log('🔄 Intentando con video genérico');
          try {
            const genericStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
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
    },
    [isCaller]
  );

  // ===================== CLEANUP GENERAL =====================
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up call resources');

    stopCollecting();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
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
  }, [stopCollecting]);

  // ===================== TERMINAR LLAMADA (BOTÓN) =====================
  const endCall = useCallback(
    async () => {
      try {
        await api.post(`/meeting/${meetingId}/end`);
        socketRef.current?.emit('end-call', { meetingId });
      } catch (error) {
        console.error('Error ending meeting:', error);
      }

      cleanup();
      window.location.href = '/';
    },
    [meetingId, cleanup]
  );

  // ===================== EFFECT PRINCIPAL =====================
  useEffect(() => {
    if (!meetingId) return;

    // Evitar crear varios sockets
    if (socketRef.current) {
      console.log('⚠️ Socket ya inicializado, no creo otro');
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      'https://skillswap-signaling.onrender.com';

    console.log('🔌 Conectando a socket:', socketUrl);

    const socket = io(socketUrl, {
      timeout: 15000,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Logs de conexión
    socket.on('connecting', () => {
      console.log('🔌 Socket connecting...');
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully, ID:', socket.id);
      // 🔥 Unirse a la sala de esta meeting
      socketRef.current?.emit('join', { meetingId });
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión socket:', error.message);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`🔌 Socket reconnected after ${attempt} attempts`);
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔌 Socket reconnect error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('🔌 Socket reconnect failed');
    });

    // Loggear todos los emit
    const originalEmit = socket.emit;
    socket.emit = function (event, ...args) {
      console.log(
        `📤 Emitting "${event}":`,
        args[0] ? 'data present' : 'no data'
      );
      return originalEmit.apply(this, [event, ...args]);
    };

    // -------- HANDLERS DE SEÑALIZACIÓN --------
    const handleOffer = async ({ offer, call_id, meetingId: incomingMeeting }) => {
      // Si viniera algo de otra sala por error, lo ignoramos
      if (incomingMeeting && incomingMeeting !== meetingId) return;

      console.log('📞 OFFER RECEIVED - Starting receiver process');

      if (callStarted || otherUserId) {
        console.log(
          'Ignoring offer: already call started o somos el caller en esta instancia'
        );
        return;
      }

      setCallStarted(true);
      setIsCaller(false);
      localStorage.setItem('call_id', call_id);

      try {
        console.log('🎯 Getting local media (receiver)...');
        const stream = await getLocalMedia();
        console.log(
          '✅ Local media obtained, tracks:',
          stream?.getTracks().length
        );

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        });

        pcRef.current = pc;

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('📤 Sending ICE candidate from receiver');
            socket.emit('ice-candidate', {
              candidate: event.candidate,
              meetingId,
            });
          }
        };

        pc.ontrack = (event) => {
          console.log('🎬 Receiver received remote track:', event.track.kind);
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            console.log('✅ Receiver remote video stream set');
          }
        };

        if (stream) {
          stream.getTracks().forEach((track) => {
            console.log('📹 Receiver adding local track:', track.kind);
            pc.addTrack(track, stream);
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }

        console.log('🔄 Setting remote description (offer)...');
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        console.log('🔄 Creating answer...');
        const answer = await pc.createAnswer();

        console.log('🔄 Setting local description (answer)...');
        await pc.setLocalDescription(answer);

        console.log('📤 Sending answer to caller, call_id:', call_id);
        socket.emit('answer', { answer, call_id, meetingId });

        startCollecting();
        console.log('✅✅✅ RECEIVER FULLY READY ✅✅✅');
      } catch (error) {
        console.error('❌ ERROR in receiver:', error);
        setCallStarted(false);
        setIsCaller(false);
      }
    };

    const handleAnswer = async ({ answer, meetingId: incomingMeeting }) => {
      if (incomingMeeting && incomingMeeting !== meetingId) return;

      const pc = pcRef.current;
      if (!pc) {
        console.warn('No PeerConnection for answer');
        return;
      }

      console.log('📨 Received answer, current state:', pc.signalingState);

      if (pc.signalingState !== 'have-local-offer') {
        console.warn(
          'Ignoring answer because signalingState is',
          pc.signalingState
        );
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

    const handleIceCandidate = async ({
      candidate,
      meetingId: incomingMeeting,
    }) => {
      if (incomingMeeting && incomingMeeting !== meetingId) return;
      if (!pcRef.current || !candidate) return;

      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.log('ICE candidate add error (no grave):', err.message);
      }
    };

    const handleEndCall = ({ meetingId: endedMeetingId }) => {
      if (endedMeetingId !== meetingId) return;
      console.log('📴 Received end-call signal');
      cleanup();
      window.location.href = '/';
    };

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('end-call', handleEndCall);

    // -------- DETERMINAR ROL Y ARRANCAR CALLER --------
    const isCurrentUserCaller = !!otherUserId;
    console.log('🎭 Role determination:', {
      otherUserId: !!otherUserId,
      isCurrentUserCaller,
    });

    let callTimer = null;

    if (isCurrentUserCaller) {
      console.log('🎯 This user is the CALLER, starting in 3s...');
      setIsCaller(true);

      const startCallInternal = async () => {
        if (callStarted) return;

        try {
          console.log('🚀 Starting call as caller');
          setCallStarted(true);

          const callId = await startCall(otherUserId, usuarioHabilidadId);
          localStorage.setItem('call_id', callId);

          // Esperar conexión del socket
          console.log('⏳ Waiting for socket connection...');
          await new Promise((resolve, reject) => {
            if (socket.connected) {
              console.log('✅ Socket already connected');
              resolve();
              return;
            }

            const check = setInterval(() => {
              if (socket.connected) {
                clearInterval(check);
                console.log('✅ Socket now connected');
                resolve();
              }
            }, 100);

            setTimeout(() => {
              clearInterval(check);
              reject(new Error('Socket connection timeout'));
            }, 10000);

            const onConnect = () => {
              clearInterval(check);
              socket.off('connect', onConnect);
              console.log('✅ Socket connected via event');
              resolve();
            };

            socket.on('connect', onConnect);
          });

          console.log('🎯 Getting local media (caller)...');
          const stream = await getLocalMedia();
          console.log(
            '✅ Local media obtained, tracks:',
            stream?.getTracks().length
          );

          localStreamRef.current = stream;

          const pc = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
            ],
          });

          pcRef.current = pc;

          pc.onicecandidate = (event) => {
            if (event.candidate && socket.connected) {
              console.log('📤 Sending ICE candidate from caller');
              socket.emit('ice-candidate', {
                candidate: event.candidate,
                meetingId,
              });
            }
          };

          pc.ontrack = (event) => {
            console.log('🎬 Caller received REMOTE track:', event.track.kind);
            if (remoteVideoRef.current && event.streams[0]) {
              remoteVideoRef.current.srcObject = event.streams[0];
              console.log('✅ Remote video stream set');
            }
          };

          if (stream) {
            stream.getTracks().forEach((track) => {
              console.log('📹 Caller adding local track:', track.kind);
              pc.addTrack(track, stream);
            });
          }

          console.log('🔄 Creating offer...');
          const offer = await pc.createOffer();

          console.log('🔄 Setting local description (offer)...');
          await pc.setLocalDescription(offer);

          console.log('📤 Sending offer to receiver, call_id:', callId);
          socket.emit('offer', { offer, call_id: callId, meetingId });

          startCollecting();
          console.log('✅ Caller ready and waiting for answer');
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

    // Cleanup del effect
    return () => {
      console.log('🧹 Cleanup socket effect (unmounting)');
      if (callTimer) clearTimeout(callTimer);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('end-call', handleEndCall);
    };
  }, [
    meetingId,
    otherUserId,
    usuarioHabilidadId,
    callStarted,
    startCall,
    getLocalMedia,
    startCollecting,
    cleanup,
  ]);

  // ===================== RENDER =====================
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
              console.log('🎬 Remote video can play - attempting play()');
              remoteVideoRef.current
                ?.play()
                .catch((e) =>
                  console.log('⚠️ Auto-play blocked:', e.message)
                );
            }}
            onPlaying={() => console.log('▶️ Remote video IS PLAYING!')}
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
