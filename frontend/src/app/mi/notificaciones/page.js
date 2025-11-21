'use client';

import { useNotifications } from '@/context/NotificacionesContext';
import Link from 'next/link';

export default function NotifsPage() {
  const notifs = useNotifications();
  const items = notifs?.items ?? [];
  const unread = notifs?.unread ?? 0;
  const markAllRead = notifs?.markAllRead ?? (() => {});

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      {/* Header de la sección */}
      <header className="mb-5 border-b border-slate-800 pb-3 space-y-2">
        {/* Link volver */}
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-sans"
        >
          <span className="text-sm">←</span>
          Volver a mi perfil
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-pixel text-lg md:text-xl tracking-[0.18em] uppercase text-slate-50">
              Notificaciones
            </h1>
            <p className="mt-1 text-sm text-slate-300 font-sans tracking-normal normal-case">
              Acá vas a ver los avisos sobre reservas y los enlaces a las reuniones.
            </p>
          </div>

          <button
            onClick={markAllRead}
            disabled={unread === 0}  
            className="
              font-pixel
              border-2 border-[#0f172a] bg-[#cde8ff] text-[#0b0c10]
              px-3 py-[4px] text-[10px] md:text-xs tracking-[0.12em] uppercase
              rounded-none
              shadow-[2px_2px_0_0_rgba(15,23,42,1)]
              hover:bg-[#bfe0ff] hover:translate-x-[1px] hover:translate-y-[1px]
              active:translate-x-[2px] active:translate-y-[2px]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Marcar todas como leídas
          </button>
        </div>
      </header>

      {/* Lista de notificaciones */}
      {items.length === 0 ? (
        <p className="text-sm text-slate-300 font-sans">
          Sin notificaciones por ahora. Cuando coordines una sesión, vas a ver el enlace a la
          llamada acá.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className="
                border border-slate-800 bg-slate-900/60
                rounded-lg px-3 py-2.5
                shadow-[2px_2px_0_0_rgba(15,23,42,1)]
                flex flex-col gap-1
              "
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-pixel text-[10px] uppercase tracking-[0.15em] text-cyan-300">
                  {n.tipo || 'Notificación'}
                </span>
                {n.created_at && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                )}
              </div>

              {n.message && (
                <p className="text-sm text-slate-100 font-sans">
                  {n.message}
                </p>
              )}

              {n.data?.join_url && (
                <div className="mt-1">
                  <Link
                    href={n.data.join_url}
                    target="_blank"
                    className="
                      inline-block mt-1
                      font-pixel
                      border-2 border-[#0f172a] bg-[#cde8ff] text-[#0b0c10]
                      px-3 py-[4px] text-[10px] md:text-xs tracking-[0.12em] uppercase
                      rounded-none
                      shadow-[2px_2px_0_0_rgba(15,23,42,1)]
                      hover:bg-[#bfe0ff] hover:translate-x-[1px] hover:translate-y-[1px]
                      active:translate-x-[2px] active:translate-y-[2px]
                    "
                  >
                    Entrar a la reunión
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
