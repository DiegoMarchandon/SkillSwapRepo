'use client';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function WebRTCPage() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const [isCaller, setIsCaller] = useState(false);
  const statsIntervalRef = useRef(null); //Referencia para el intervalo
  const metricsRef = useRef([]); //Referencia para las métricas


  useEffect(() => {
    // 1️⃣ Conectarse al servidor Socket.io (asegurate que está en puerto 4000)
    socketRef.current = io('http://localhost:4000');

    // 2️⃣ Configurar servidor STUN/TURN
    pcRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:localhost:3478', username: 'admin', credential: '12345' }
      ]
    });

    // Función para recolectar métricas
const collectStats = async () => {
  const stats = await pcRef.current.getStats();
  stats.forEach(report => {
    if (report.type === 'outbound-rtp' && report.kind === 'video') {
      metricsRef.push({
        timestamp: report.timestamp,
        bytesSent: report.bytesSent,
        framesPerSecond: report.framesPerSecond,
        packetsSent: report.packetsSent,
        roundTripTime: report.roundTripTime
      });
    }
    if (report.type === 'inbound-rtp' && report.kind === 'video') {
      metricsRef.push({
        timestamp: report.timestamp,
        bytesReceived: report.bytesReceived,
        packetsLost: report.packetsLost,
        jitter: report.jitter
      });
    }
  });
};

// Iniciar la recolección cuando arranca la llamada
const startCollecting = () => {
  statsIntervalRef.current = setInterval(collectStats, 5000); // cada 5 segundos
};

  // 3️⃣ Enviar ICE candidates al otro peer
  pcRef.current.onicecandidate = (event) => {
    if (event.candidate) {
      socketRef.current.emit('ice-candidate', event.candidate);
    }
  };

  // 4️⃣ Cuando llegue una pista remota, mostrarla
  pcRef.current.ontrack = (event) => {
    remoteVideoRef.current.srcObject = event.streams[0];
  };

  // 5️⃣ Escuchar mensajes del servidor Socket.io
  socketRef.current.on('offer', async (offer) => {
    if (!isCaller) {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));
      localVideoRef.current.srcObject = stream;
  
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit('answer', answer);
      
      // Iniciar la recolección cuando se responde la llamada
      startCollecting();
    }
  });

  socketRef.current.on('answer', async (answer) => {
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  });
  
  socketRef.current.on('ice-candidate', async (candidate) => {
    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Error agregando ICE candidate:', err);
    }
  });
  
      return () => {
        // Limpiar al desmontar el componente
        if(statsIntervalRef.current){
          clearInterval(statsIntervalRef.current);
        }
        socketRef.current.disconnect();
      };
    }, [isCaller]);

// Detener y mostrar métricas cuando termine la llamada
const stopCollecting = () => {
  if(statsIntervalRef.current){
    clearInterval(statsIntervalRef.current);
    statsIntervalRef.current = null;
  }
  console.table(metricsRef.current);
  metricsRef.current = []; // Reiniciar métricas para la próxima llamada
  // 👇 más adelante, vas a enviar esto a Laravel vía API
};


  // 6️⃣ Función para iniciar la llamada
  const startCall = async () => {
    setIsCaller(true);
    // const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
    socketRef.current.emit('offer', offer);

    const startCollecting = () => {
      statsIntervalRef.current = setInterval(async () => {
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
      }, 5000);
    };

    startCollecting();
  };

  const endCall = () => {
    stopCollecting(); // Detiene el interval y muestra las métricas
  
    // Detiene los tracks locales (apaga cámara y micrófono)
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  
    // Cerrar la conexión WebRTC
    if (pcRef.current) {
      pcRef.current.close();
    }

    // Cerrar la conexión del socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  
    alert('Llamada finalizada. Revisa la consola para ver las métricas.');
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Videollamada WebRTC</h1>
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 border rounded" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 border rounded" />
      </div>
      <button
        onClick={startCall}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 m-3"
      >
        Iniciar llamada
      </button>
      <button
        onClick={endCall}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 m-3"
      >
        Terminar llamada
      </button>
    </div>
  );
}

