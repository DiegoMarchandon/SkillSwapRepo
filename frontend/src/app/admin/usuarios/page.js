"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/utils/axios";
import Header from "@/components/layout/Header";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [onlyBlocked, setOnlyBlocked] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [target, setTarget] = useState(null); // user para modal

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", {
        params: { q: q || undefined, is_blocked: onlyBlocked ? 1 : undefined },
      });
      setRows(data?.data ?? []); // viene paginado
    } catch (err) {
      console.error("Error cargando usuarios", err);
      toast.error("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyBlocked]);

  async function doBlock(id) {
    try {
      await api.patch(`/admin/users/${id}/block`, {
        is_blocked: true,
        blocked_reason: reason?.trim() || null,
      });
      toast.success("Usuario bloqueado.");
      setTarget(null);
      setReason("");
      await load();
    } catch (err) {
      console.error("Error bloqueando usuario", err);
      toast.error("No se pudo bloquear el usuario.");
    }
  }

  async function doUnblock(id) {
    try {
      await api.patch(`/admin/users/${id}/block`, { is_blocked: false });
      toast.success("Usuario desbloqueado.");
      await load();
    } catch (err) {
      console.error("Error desbloqueando usuario", err);
      toast.error("No se pudo desbloquear el usuario.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-pixel">
      <Header />

      <main className="max-w-5xl mx-auto py-10 px-4">
        <section className="border-2 border-cyan-400 rounded-xl bg-slate-900 shadow-[0_0_0_3px_rgba(15,23,42,1)] space-y-0">
          {/* HEADER */}
          <header className="border-b border-slate-800 px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl tracking-[0.15em] uppercase">
                Gestión de usuarios
              </h1>
              <p className="text-xs md:text-sm text-slate-300">
                Bloqueá o desbloqueá perfiles de la plataforma.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 text-xs md:text-sm border-[3px] border-black bg-slate-100 text-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-slate-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              ← Volver al historial
            </Link>
          </header>

          {/* FILTROS */}
          <div className="px-6 py-4 border-b border-slate-800 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              className="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
              placeholder="Buscar por nombre, mail o ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={onlyBlocked}
                onChange={(e) => setOnlyBlocked(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              Solo bloqueados
            </label>
            <button
              onClick={load}
              className="px-4 py-2 text-xs md:text-sm border-2 border-black bg-emerald-300 text-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-emerald-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              Buscar
            </button>
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px] leading-6">
              <thead className="bg-slate-900/70 border-b border-slate-800 text-slate-300 uppercase text-[11px]">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Usuario</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  <th className="px-6 py-3 text-left w-40">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-6 text-center text-slate-300"
                    >
                      Cargando…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-6 text-center text-slate-400"
                    >
                      Sin resultados.
                    </td>
                  </tr>
                ) : (
                  rows.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={`border-t border-slate-800 ${
                        idx % 2 === 0 ? "bg-slate-950" : "bg-slate-900"
                      }`}
                    >
                      <td className="px-6 py-3 align-middle">{u.id}</td>
                      <td className="px-6 py-3 align-middle">{u.name}</td>
                      <td className="px-6 py-3 align-middle text-slate-300">
                        {u.email}
                      </td>
                      <td className="px-6 py-3 align-middle">
                        {u.is_blocked ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] border border-rose-400/50">
                            BLOQUEADO
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] border border-emerald-400/60">
                            ACTIVO
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 align-middle">
                        {u.is_blocked ? (
                          <button
                            onClick={() => doUnblock(u.id)}
                            className="px-3 py-1.5 text-xs border-2 border-black bg-emerald-300 text-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:bg-emerald-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                          >
                            Desbloquear
                          </button>
                        ) : (
                          <button
                            onClick={() => setTarget(u)}
                            className="px-3 py-1.5 text-xs border-2 border-black bg-rose-400 text-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:bg-rose-300 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                          >
                            Bloquear
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODAL MOTIVO BLOQUEO */}
        {target && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="w-[420px] max-w-full border-2 border-cyan-400 bg-slate-900 text-slate-100 shadow-[0_0_0_3px_rgba(15,23,42,1)] p-4 space-y-3">
              <h3 className="text-lg tracking-[0.15em] uppercase">
                Bloquear a {target.name}
              </h3>
              <textarea
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                rows={3}
                placeholder="Motivo (opcional)…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => {
                    setTarget(null);
                    setReason("");
                  }}
                  className="px-3 py-1.5 border-2 border-black bg-slate-700 text-slate-100 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:bg-slate-600 hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => doBlock(target.id)}
                  className="px-3 py-1.5 border-2 border-black bg-rose-500 text-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:bg-rose-400 hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  Confirmar bloqueo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
