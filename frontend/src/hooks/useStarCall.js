import api from '@/utils/axios';
import { useAuth } from '@/context/AuthContext';

export default function useStartCall() {
  const { user } = useAuth();

  const startCall = async (receiverId, usuarioHabilidadId = null) => {
    let callId;

    try {
      console.log('🧾 Creando llamada en backend con:', {
        caller_id: user?.id,
        receiver_id: receiverId,
        usuario_habilidad_id: usuarioHabilidadId,
      });

      const { data } = await api.post('/calls', { 
        caller_id: user?.id,
        receiver_id: receiverId,
        usuario_habilidad_id: usuarioHabilidadId,
      });

      // Intentar leer el ID devuelto por el backend
      callId = data?.call_id || data?.id || data?.call?.id;
      console.log('📞 Llamada creada en backend con ID:', callId);
    } catch (err) {
      const status = err?.response?.status;
      console.error(
        '❌ Error al crear la llamada en backend:',
        status,
        err?.response?.data || err
      );

      // ⚠️ Para la demo: si el backend falla, inventamos un ID y seguimos
      const fallback =
        typeof window !== 'undefined' && window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : `local-${Date.now()}`;

      console.warn('⚠️ Usando call_id local de fallback:', fallback);
      callId = fallback;
    }

    // Guardamos SIEMPRE el call_id que vayamos a usar
    if (typeof window !== 'undefined') {
      localStorage.setItem('call_id', callId);
    }

    return callId;
  };

  return { startCall };
}
