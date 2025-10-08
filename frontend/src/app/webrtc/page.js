'use client';
import { useEffect } from 'react';

export default function WebRTCPage() {
  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:localhost:3478' },
        { urls: 'turn:localhost:3478', username: 'admin', credential: '12345' }
      ]
    });

    pc.onicecandidate = e => console.log('ICE candidate:', e.candidate);
    pc.createDataChannel("test");
    pc.createOffer().then(o => pc.setLocalDescription(o));
  }, []);

  return <h1>WebRTC Test</h1>;
}
