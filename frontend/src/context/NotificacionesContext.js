'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../utils/axios';

const Ctx = createContext(null);

export function useNotifications() {
  return useContext(Ctx);
}

export default function NotificationsProvider({ children }) {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const sinceRef = useRef(null);
  const timer = useRef(null);

  async function refreshCount() {
    try {
      const { data } = await api.get('/notificaciones/unread');
      setUnread(data?.count ?? 0);
    } catch (_) {}
  }

  async function fetchLatest() {
    try {
      const qs = sinceRef.current ? `?since=${encodeURIComponent(sinceRef.current)}` : '';
      const { data } = await api.get('/notificaciones/latest' + qs);
      if (Array.isArray(data) && data.length) {
        setItems((prev) => [...data.reverse(), ...prev].slice(0, 50));
        sinceRef.current = new Date().toISOString();
        refreshCount();
      }
    } catch (_) {}
  }

  useEffect(() => {
    refreshCount();
    fetchLatest();
    timer.current = setInterval(fetchLatest, 10000);
    return () => clearInterval(timer.current);
  }, []);

  async function markAllRead() {
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
