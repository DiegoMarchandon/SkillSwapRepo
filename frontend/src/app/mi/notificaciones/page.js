'use client';
import { useNotifications } from '@/context/NotificacionesContext';
import Link from 'next/link';

export default function NotifsPage() {
  const { items, markAllRead } = useNotifications();
  return (
    <section className="max-w-2xl mx-auto p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notificaciones</h1>
        <button onClick={markAllRead} className="px-3 py-1 rounded bg-gray-800 text-white text-sm">
          Marcar todas como leídas
        </button>
      </div>
      <ul className="space-y-2">
        {items.map(n => (
          <li key={n.id} className="p-3 border rounded">
            <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
            <div className="font-medium">{n.tipo}</div>
            {n.data?.join_url && <Link className="text-indigo-600 underline" href={n.data.join_url}>Entrar a la reunión</Link>}
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-gray-500">Sin notificaciones por ahora.</li>}
      </ul>
    </section>
  );
}
