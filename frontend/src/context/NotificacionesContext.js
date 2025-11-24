'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import api from '../utils/axios';
import { useAuth } from './AuthContext';

const Ctx = createContext(null);

export function useNotifications() {
  return useContext(Ctx);
}

function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const sinceRef = useRef(null);
  const timer = useRef(null);

  const hasToken = useCallback(
    () => typeof window !== 'undefined' && !!localStorage.getItem('token'),
    []
  );

  const stopPolling = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const refreshCount = useCallback(async () => {
    if (!user || !hasToken()) return;
    try {
      const { data } = await api.get('/notificaciones/unread');
      setUnread(data?.count ?? 0);
    } catch (err) {
      console.error(
        'Error obteniendo unread',
        err?.response?.status,
        err?.response?.data
      );
      if (err?.response?.status === 401) stopPolling();
    }
  }, [user, hasToken, stopPolling]);

  const fetchLatest = useCallback(async () => {
    if (!user || !hasToken()) return;
    try {
      const qs = sinceRef.current
        ? `?since=${encodeURIComponent(sinceRef.current)}`
        : '';
      const { data } = await api.get('/notificaciones/latest' + qs);

      if (Array.isArray(data) && data.length) {
        // agregamos nuevas al principio, manteniendo como máximo 50
        setItems((prev) => [...data.reverse(), ...prev].slice(0, 50));
        // ahora sí: movemos el cursor a "ahora"
        sinceRef.current = new Date().toISOString();
        refreshCount();
      }
    } catch (err) {
      console.error(
        'Error obteniendo notificaciones',
        err?.response?.status,
        err?.response?.data
      );
      if (err?.response?.status === 401) stopPolling();
    }
  }, [user, hasToken, refreshCount, stopPolling]);

  const startPolling = useCallback(() => {
    // 👇 IMPORTANTE: no adelantar el "since"
    // Primer fetch debe traer las últimas 20 sin filtro de fecha
    sinceRef.current = null;

    refreshCount();
    fetchLatest();

    stopPolling(); // por las dudas
    timer.current = setInterval(fetchLatest, 10000);
  }, [refreshCount, fetchLatest, stopPolling]);

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
  }, [user, hasToken, startPolling, stopPolling]);

  const markAllRead = useCallback(async () => {
    if (!user || !hasToken()) return;
    try {
      await api.post('/notificaciones/read-all');

      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at ?? now,
          leida: true,
        }))
      );

      setUnread(0);
      sinceRef.current = new Date().toISOString();
    } catch (err) {
      console.error(
        'Error marcando todas como leídas',
        err?.response?.status,
        err?.response?.data
      );
      setUnread(0);
    }
  }, [user, hasToken]);

  return (
    <Ctx.Provider value={{ unread, items, markAllRead, refreshCount }}>
      {children}
    </Ctx.Provider>
  );
}

export default NotificationsProvider;
