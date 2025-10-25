'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../utils/axios';
import { useAuth } from './AuthContext';

const Ctx = createContext(null);

export function useNotifications() {
  return useContext(Ctx);
}

export default function NotificationsProvider({ children }) {
  const { user } = useAuth();              // ← clave: sólo correr con usuario
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const sinceRef = useRef(null);
  const timer = useRef(null);

  const hasToken = () =>
    typeof window !== 'undefined' && !!localStorage.getItem('token');

  async function refreshCount() {
    if (!user || !hasToken()) return;
    try {
      const { data } = await api.get('/notificaciones/unread');
      setUnread(data?.count ?? 0);
    } catch (err) {
      // Si perdimos sesión, paramos el polling
      if (err?.response?.status === 401) stopPolling();
    }
  }

  async function fetchLatest() {
    if (!user || !hasToken()) return;
    try {
      const qs = sinceRef.current ? `?since=${encodeURIComponent(sinceRef.current)}` : '';
      const { data } = await api.get('/notificaciones/latest' + qs);
      if (Array.isArray(data) && data.length) {
        setItems(prev => [...data.reverse(), ...prev].slice(0, 50));
        sinceRef.current = new Date().toISOString();
        refreshCount();
      }
    } catch (err) {
      if (err?.response?.status === 401) stopPolling();
    }
  }

  function startPolling() {
    // reset de estado de ventana deslogueada
    sinceRef.current = new Date().toISOString();
    refreshCount();
    fetchLatest();
    stopPolling(); // por las dudas, limpiamos antes
    timer.current = setInterval(fetchLatest, 10000);
  }

  function stopPolling() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }

  // Arrancar / detener polling al (des)loguear
  useEffect(() => {
    if (user && hasToken()) {
      startPolling();
    } else {
      stopPolling();
      setUnread(0);
      setItems([]);
      sinceRef.current = null;
    }
    return () => stopPolling();
  }, [user]);

  // API pública del contexto
  async function markAllRead() {
    if (!user || !hasToken()) return;
    try {
      await api.post('/notificaciones/read-all');
      setUnread(0);
    } catch (_) {}
  }

  return (
    <Ctx.Provider value={{ unread, items, markAllRead, refreshCount }}>
      {children}
    </Ctx.Provider>
  );
}
