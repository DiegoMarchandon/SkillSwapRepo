"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import AdminGate from "@/components/admin/AdminGate";

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
  } finally { setLoading(false); }
}

async function doBlock(id) {
  await api.patch(`/admin/users/${id}/block`, {
    is_blocked: true,
    blocked_reason: reason?.trim() || null,
  });
  setTarget(null); setReason("");
  await load();
}

async function doUnblock(id) {
  await api.patch(`/admin/users/${id}/block`, { is_blocked: false });
  await load();
}




  return (
    <AdminGate>
      <section className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Usuarios</h1>

        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="Buscar por nombre, mail o ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <label className="flex items-center gap-2 border rounded px-3">
            <input
              type="checkbox"
              checked={onlyBlocked}
              onChange={(e) => setOnlyBlocked(e.target.checked)}
            />
            Solo bloqueados
          </label>
          <button onClick={load} className="bg-zinc-900 text-white px-4 py-2 rounded">
            Buscar
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-3" colSpan={5}>Cargando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="p-3" colSpan={5}>Sin resultados.</td></tr>
              ) : rows.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    {u.is_blocked
                      ? <span className="px-2 py-1 rounded bg-rose-100 text-rose-700">Bloqueado</span>
                      : <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700">Activo</span>}
                  </td>
                  <td className="p-3">
                    {u.is_blocked ? (
                      <button onClick={() => doUnblock(u.id)} className="px-3 py-1 rounded bg-emerald-600 text-white">
                        Desbloquear
                      </button>
                    ) : (
                      <button onClick={() => setTarget(u)} className="px-3 py-1 rounded bg-rose-600 text-white">
                        Bloquear
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal motivo */}
        {target && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 w-[420px] space-y-3">
              <h3 className="text-lg font-semibold">Bloquear a {target.name}</h3>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                placeholder="Motivo (opcional)…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setTarget(null); setReason(""); }} className="px-3 py-2 rounded">
                  Cancelar
                </button>
                <button onClick={() => doBlock(target.id)} className="px-3 py-2 rounded bg-rose-600 text-white">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </AdminGate>
  );
}
