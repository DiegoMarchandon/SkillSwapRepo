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
  const [isCaller, setIsCaller] = useState(false);

  const { user } = useAuth();
  const { startCall } = useStartCall();

  const search = useSearchParams();
  const meetingId = search.get('meeting_id');
  const otherUserId = search.get('other_user_id');
  const usuarioHabilidadId = search.get('usuario_habilidad_id');

  // ---- Métricas WebRTC
  const collectStats = useCallback(async () => {
    if (!pcRef.current) return;
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
    // console.table(metricsRef.current);
  }, []);

  // ---- Efecto principal: Sockets + RTCPeerConnection + handlers
  useEffect(() => {
    // Socket
    socketRef.current = io('http://localhost:4000');

    // RTCPeerConnection
    pcRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:localhost:3478', username: 'admin', credential: '12345' },
      ],
    });

    // ICE locales
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', event.candidate);
      }
    };

    // Recibir media remota
    pcRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Oferta entrante
    socketRef.current.on('offer', async ({ offer, call_id }) => {
      if (isCaller) return; // si soy caller, ignoro
      localStorage.setItem('call_id', call_id);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit('answer', { answer, call_id });

      startCollecting();
    });

    // Respuesta entrante
    socketRef.current.on('answer', async ({ answer }) => {
      if (pcRef.current.signalingState !== 'have-local-offer') {
        console.warn('Ignorando answer: estado incorrecto', pcRef.current.signalingState);
        return;
      }
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // ICE remotos
    socketRef.current.on('ice-candidate', async (candidate) => {
      if (!pcRef.current || pcRef.current.signalingState === 'closed') return;
      if (!pcRef.current.remoteDescription) {
        console.warn('ICE remoto ignorado: remoteDescription no establecida aún');
        return;
      }
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error agregando ICE candidate:', err);
      }
    });

    // Evento fin de llamada
    socketRef.current.on('end-call', ({ meetingId: endedMeetingId }) => {
      if (endedMeetingId !== meetingId) return;
      stopCollecting();
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (pcRef.current) pcRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
      window.location.href = '/';
    });

    // Iniciar llamada automáticamente (si tengo destinatario)
    const startCallAutomatically = async () => {
      if (!otherUserId) {
        console.error('No hay otherUserId para iniciar la llamada.');
        return;
      }

      setIsCaller(true);
      try {
        const callId = await startCall(otherUserId, usuarioHabilidadId);
        localStorage.setItem('call_id', callId);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevice = devices.find(d => d.kind === 'videoinput' && d.label.includes('Integrated'))?.deviceId;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: videoDevice ? { exact: videoDevice } : undefined },
          audio: true,
        });

        stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        socketRef.current.emit('offer', { offer, call_id: callId });
        startCollecting();
      } catch (err) {
        console.error('Error al iniciar automáticamente:', err);
      }
    };

    const t = setTimeout(startCallAutomatically, 1000);

    return () => {
      clearTimeout(t);
      stopCollecting();
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isCaller, meetingId, otherUserId, usuarioHabilidadId, startCall, startCollecting, stopCollecting]);

  // Terminar llamada manualmente
  const endCall = useCallback(async () => {
    try {
      await api.post(`/meeting/${meetingId}/end`);
      socketRef.current?.emit('end-call', { meetingId });
    } catch (error) {
      console.error('Error actualizando meeting_ended_at:', error);
    }

    stopCollecting();

    const payload = {
      call_id: parseInt(localStorage.getItem('call_id')),
      metrics: (metricsRef.current || []).map(m => ({
        timestamp: Math.floor(Number(m.timestamp) / 1000),
        bytesSent: m.bytesSent ?? 0,
        bytesReceived: m.bytesReceived ?? 0,
        framesPerSecond: m.framesPerSecond ?? 0,
        roundTripTime: m.roundTripTime ?? 0,
        packetsLost: m.packetsLost ?? 0,
        jitter: m.jitter ?? 0,
      })),
    };

    if (payload.metrics.length) {
      try {
        await api.post('/call-metrics', payload);
      } catch (e) {
        console.error('Error enviando métricas:', e);
      }
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) pcRef.current.close();
    if (socketRef.current) socketRef.current.disconnect();

    window.location.href = '/';
  }, [meetingId, stopCollecting]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Videollamada WebRTC</h1>
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 border rounded" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 border rounded" />
      </div>
      <button
        onClick={endCall}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 m-3"
      >
        Terminar llamada
      </button>
    </div>
  );
}
