import api from '@/utils/axios';
import { useAuth } from '@/context/AuthContext';

export default function useStartCall() {
  const { user } = useAuth();

  const startCall = async (receiverId, usuarioHabilidadId = null) => {
    try {
      console.log({caller_id: user?.id,receiver_id: receiverId, usuario_habilidad_id:usuarioHabilidadId});
      // POST al backend para crear la llamada
      const { data } = await api.post('/calls', { 
        caller_id: user?.id,
        receiver_id: receiverId,
        usuario_habilidad_id:usuarioHabilidadId
      });
        // guardamos call_id para usarlo en métricas y conexión WebRTC
      localStorage.setItem('call_id', data.call_id);
      console.log("llamada creada en backend con ID: ", data.call_id);
      return data.call_id;
    } catch (err) {
      console.error('Error al crear la llamada:', err);
      throw err;
    }
  };

  return { startCall };
}
