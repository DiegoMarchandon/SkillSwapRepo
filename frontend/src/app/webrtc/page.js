'use client';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import useStartCall from '../../hooks/useStarCall';
import { useSearchParams } from 'next/navigation';

export default function WebRTCPage() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const [isCaller, setIsCaller] = useState(false);
  const statsIntervalRef = useRef(null);
  const metricsRef = useRef([]);
  const { user } = useAuth();
  const { startCall } = useStartCall(); // ✅ corregido
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meeting_id');
  const currentUserId = searchParams.get('current_user_id');
  const otherUserId = searchParams.get('other_user_id');
  

  // Obtener receiverId y usuarioHabilidadId de la URL
  const usuarioHabilidadId = searchParams.get('usuario_habilidad_id');


  // 🧩 Recolección de métricas centralizada
  const collectStats = async () => {
    const stats = await pcRef.current.getStats();
    stats.forEach(report => {
      if (report.type === 'outbound-rtp' && report.kind === 'video') {
        metricsRef.current.push({
          timestamp: report.timestamp,
          bytesSent: report.bytesSent,
          framesPerSecond: report.framesPerSecond,
          packetsSent: report.packetsSent,
          roundTripTime: report.roundTripTime
        });
      }
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        metricsRef.current.push({
          timestamp: report.timestamp,
          bytesReceived: report.bytesReceived,
          packetsLost: report.packetsLost,
          jitter: report.jitter
        });
      }
    });
  };

  const startCollecting = () => {
    if (!statsIntervalRef.current) {
      statsIntervalRef.current = setInterval(collectStats, 5000);
    }
  };

  const stopCollecting = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
    console.table(metricsRef.current);
  };

  useEffect(() => {
    socketRef.current = io('http://localhost:4000');

    pcRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:localhost:3478', username: 'admin', credential: '12345' }
      ]
    });

    // Enviar ICE candidates
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', event.candidate);
      }
    };

    // Mostrar pista remota
    pcRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Escuchar oferta entrante
    socketRef.current.on('offer', async ({ offer, call_id }) => {
      if (!isCaller) {
        localStorage.setItem('call_id', call_id);

        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));
        localVideoRef.current.srcObject = stream;
        
        // primero establecemos la conexión remota
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));

        // Luego creamos y establecemos la respuesta
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socketRef.current.emit('answer', { answer, call_id });

        startCollecting();
      }
    });

    // Escuchar respuesta
    socketRef.current.on('answer', async ({ answer }) => {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Escuchar ICE candidates remotos
    socketRef.current.on('ice-candidate', async (candidate) => {
      if(!pcRef.current || pcRef.current.signalingState === 'closed'){
        console.warn("Ignorando ICE candidate: conexijh");
      }
      
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error agregando ICE candidate:', err);
      }
    });

    // Escuchar evento de finalización de llamada
    socketRef.current.on('end-call', ({ meetingId: endedMeetingId }) => {
      if (endedMeetingId === meetingId) {
        console.log('📢 Recibido evento end-call, finalizando llamada...');
        
        // Limpiar recursos
        stopCollecting();
        if (localVideoRef.current?.srcObject) {
          localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        if (pcRef.current) pcRef.current.close();
        if (socketRef.current) socketRef.current.disconnect();
        
        // Redirigir a home
        window.location.href = '/';
      }
    });


    // 🟢 Iniciar llamada automáticamente
    const startCallAutomatically = async () => {
      if (!otherUserId) {
        console.error('❌ No otherUserId available:', otherUserId);
        return;
      }

      console.log('🟢 Iniciando llamada automáticamente con:', otherUserId);
      setIsCaller(true);

      try {
        const callId = await startCall(otherUserId, usuarioHabilidadId);
        localStorage.setItem('call_id', callId);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevice = devices.find(d => d.kind === 'videoinput' && d.label.includes('Integrated'))?.deviceId;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: videoDevice ? { exact: videoDevice } : undefined },
          audio: true
        });

        stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));
        localVideoRef.current.srcObject = stream;

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        socketRef.current.emit('offer', { offer, call_id: callId });
        startCollecting();

        console.log('✅ Llamada iniciada automáticamente');

      } catch (err) {
        console.error('❌ Error al iniciar la llamada automáticamente:', err);
      }
    };

    // Ejecutar después de configurar Socket.io
    setTimeout(startCallAutomatically, 1000);

    return () => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
      
      if(pcRef.current){
        pcRef.current.close();
        pcRef.current = null;
      } 
      
      if(socketRef.current){
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };



  }, []);

  // 🔴 Terminar llamada
  const endCall = async () => {
    stopCollecting();
    console.log('🔴 Terminando llamada...');
    try {
      // 1. Actualizar meeting_ended_at en el backend
      await api.post(`/meeting/${meetingId}/end`); // ✅ corregido

      // 2. Notificar a TODOS los participantes vía Socket.io
      socketRef.current.emit('end-call', {meetingId});
    }catch (error){
      console.error('Error actualizando meeting_ended_at en el backend:', error);
    }

    // 3. Métricas 
    stopCollecting();
    const metrics = metricsRef.current;

    if(metrics.length){
        // Preparamos el payload transformando cada métrica para que tenga las claves que espera Laravel
      const payload = {
        call_id: parseInt(localStorage.getItem('call_id')), // asegurarse que es un integer
        metrics: metrics.map(m => ({
          // timestamp: m.timestamp ?? Date.now(),
          // timestamp: new Date(m.timestamp).toISOString().slice(0,19).replace('T', ' '),
          timestamp: Math.floor(Number(m.timestamp)/1000),
          bytesSent: m.bytesSent ?? 0,
          bytesReceived: m.bytesReceived ?? 0,
          framesPerSecond: m.framesPerSecond ?? 0,
          roundTripTime: m.roundTripTime ?? 0,
          packetsLost: m.packetsLost ?? 0,
          jitter: m.jitter ?? 0
        }))
      };

      console.log("Payload para enviar:", JSON.stringify(payload, null, 2)); // Debug: imprimir el payload);
  
      try {
        const { data } = await api.post('/call-metrics', payload);
        console.log("Métricas enviadas al backend:", data);
      } catch (error) {
        console.error("Error al enviar las métricas:", error);
      }

    }


    // 4. Limpiar recursos WebRTC: Detener los tracks locales (cámara y micrófono) 
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    // Cerrar la conexión WebRTC y Socket
    if (pcRef.current) pcRef.current.close();
    if (socketRef.current) socketRef.current.disconnect();

    // 5. redirigir al home
    console.log('✅ Redirigiendo al home...');
    // router.push('/');
    window.location.href = '/'; 
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Videollamada WebRTC</h1>
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 border rounded" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 border rounded" />
      </div>
      {/* <button
        onClick={handleStartCall}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 m-3"
      >
        Iniciar llamada
      </button> */}
      <button
        onClick={endCall}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 m-3"
      >
        Terminar llamada
      </button>
    </div>
  );
}
