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

  // Evitar arrancar 2 veces caller/receiver
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
  const role = search.get('role'); // 'caller' | 'receiver'
  const fallbackMeetUrl = process.env.NEXT_PUBLIC_FALLBACK_MEET_URL;

  // =============== MEDIA LOCAL ===============
  const getLocalMedia = useCallback(async () => {
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

      // Fallback: solo audio
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
      }

      setMediaError(`No se pudo acceder a la cámara/micrófono: ${err.message}`);
      throw err;
    }
  }, []);

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

  // =============== EFFECT PRINCIPAL (WEBRTC) ===============
  useEffect(() => {
    if (!meetingId) return;

    if (socketRef.current) {
      console.log('⚠️ WebRTC ya inicializado, omito nueva conexión');
      return;
    }

    console.log('🟢 Inicializando WebRTC, meeting:', meetingId);

    // Rol viene de la URL: alumno = caller, instructor = receiver
    const isCurrentUserCaller = role === 'caller';
    setIsCaller(isCurrentUserCaller);

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      'https://skillswap-signaling.onrender.com';

    console.log('🔌 Conectando a socket:', socketUrl);

    const socket = io(socketUrl, {
      timeout: 15000,
      transports: ['websocket', 'polling'],
      reconnection: false,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket conectado, ID:', socket.id);
      socket.emit('join', { meetingId });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ connect_error:', err.message);
    });

    // ---------- HANDLERS SEÑALIZACIÓN ----------
    const handleOffer = async ({ offer, call_id, meetingId: incomingMeeting }) => {
      if (incomingMeeting && incomingMeeting !== meetingId) return;

      console.log('📞 OFFER RECIBIDA');

      // SOLO el receiver maneja la offer
      if (isCurrentUserCaller) {
        console.log('Soy caller, ignoro offer');
        return;
      }

      if (receiverStartedRef.current) {
        console.log('Receiver ya iniciado, ignoro nueva offer');
        return;
      }
      receiverStartedRef.current = true;

      setCallStarted(true);
      localStorage.setItem('call_id', call_id);

      try {
        const stream = await getLocalMedia();

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
          ],
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

    // ---------- ARRANCAR CALLER ----------
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
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
            ],
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

    // ---------- CLEANUP EFFECT ----------
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
  }, [
    meetingId,
    role,
    otherUserId,
    usuarioHabilidadId,
    startCall,
    getLocalMedia,
    cleanup,
  ]);

  // =============== PREVIEW INICIAL DE CÁMARA ===============
  useEffect(() => {
    getLocalMedia().catch((err) => {
      console.error('❌ Error en preview inicial de cámara:', err);
    });
  }, [getLocalMedia]);

  // =============== RENDER ===============
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-slate-900/90 border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.25)] p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              SkillSwap · Videollamada{' '}
              <span className="text-cyan-400">
                {isCaller ? 'Alumno' : 'Instructor'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ID reunión: <span className="font-mono">{meetingId}</span>
            </p>
          </div>

          <span className="px-3 py-1 text-xs rounded-full bg-slate-800 border border-emerald-500/60 text-emerald-200 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            WebRTC – {callStarted ? 'Conectado' : 'Conectando...'}
          </span>
        </div>

        {mediaError && (
          <div className="bg-amber-900/40 border border-amber-500/60 text-amber-100 px-4 py-3 rounded-lg text-sm">
            {mediaError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Tu cámara (local)
            </h3>
            <div className="rounded-xl border border-emerald-500/60 bg-slate-900 overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[280px] object-cover bg-slate-800"
              />
            </div>
            {!localVideoRef.current?.srcObject && (
              <div className="text-xs text-slate-400">
                Esperando acceso a cámara...
              </div>
            )}
          </div>

          {/* Remota */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
              Cámara remota
            </h3>
            <div className="rounded-xl border border-cyan-500/60 bg-slate-900 overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-[280px] object-cover bg-black"
                onCanPlay={() => {
                  console.log('🎬 Remote video can play, intento play()');
                  remoteVideoRef.current
                    ?.play()
                    .catch((e) =>
                      console.log('⚠️ Auto-play bloqueado:', e.message)
                    );
                }}
                onPlaying={() => console.log('▶️ Remote video PLAYING')}
              />
            </div>
            {remoteVideoRef.current?.srcObject ? (
              <div className="text-xs text-emerald-300">
                ✅ Recibiendo video remoto
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Esperando video remoto...
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={endCall}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-semibold text-white shadow-md shadow-red-900/40"
            >
              Terminar llamada
            </button>

            {fallbackMeetUrl && (
              <button
                type="button"
                onClick={() => window.open(fallbackMeetUrl, '_blank')}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-sm font-semibold text-slate-900 shadow-md shadow-amber-900/30 flex items-center gap-2"
              >
                <span>Plan B: abrir Google Meet</span>
              </button>
            )}
          </div>

          <span className="text-xs text-slate-400">
            Estado:{' '}
            {callStarted ? '✅ Conectado' : '⏳ Intentando conectar...'} · Rol:{' '}
            {isCaller ? '🎤 Alumno (caller)' : '🎧 Instructor (receiver)'}
          </span>
        </div>

        {fallbackMeetUrl && (
          <p className="text-[11px] text-slate-500 mt-1">
            Si la videollamada WebRTC se ve muy lenta o no aparece el video remoto
            (por restricciones de red o firewall), podés continuar la sesión usando
            el plan B por Google Meet con el botón de arriba.
          </p>
        )}
      </div>
    </div>
  );
}
