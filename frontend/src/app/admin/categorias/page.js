"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/utils/axios";
import Header from "@/components/layout/Header";

export default function AdminCategoriasPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    activa: true,
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/admin/categorias"); // paginate
      setItems(res.data?.data ?? []);
    } catch (err) {
      console.error("Error cargando categorías", err);
      toast.error("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditId(null);
    setForm({ nombre: "", descripcion: "", activa: true });
  }

  function startEdit(cat) {
    setEditId(cat.id);
    setForm({
      nombre: cat.nombre,
      descripcion: cat.descripcion ?? "",
      activa: !!cat.activa,
    });
  }

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, activa: !!form.activa };

    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/categorias/${editId}`, payload);
        toast.success("Categoría actualizada");
      } else {
        await api.post(`/admin/categorias`, payload);
        toast.success("Categoría creada");
      }
      startCreate();
      await load();
    } catch (err) {
      console.error("Error guardando categoría", err);
      toast.error("No se pudo guardar la categoría.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(cat) {
    if (!confirm(`¿Eliminar "${cat.nombre}"?`)) return;
    try {
      await api.delete(`/admin/categorias/${cat.id}`);
      toast.success("Categoría eliminada");
      await load();
    } catch (err) {
      console.error("Error eliminando categoría", err);
      const msg =
        err?.response?.data?.message ??
        "No se pudo eliminar la categoría (puede que esté en uso).";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-pixel">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="border-2 border-cyan-400 rounded-xl bg-slate-900 shadow-[0_0_0_3px_rgba(15,23,42,1)]">
          {/* HEADER TARJETA */}
          <header className="border-b border-slate-800 px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl tracking-[0.15em] uppercase">
                Categorías
              </h1>
              <p className="text-xs md:text-sm text-slate-300">
                Organizá las habilidades de la plataforma por categoría.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 text-xs md:text-sm border-[3px] border-black bg-slate-100 text-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-slate-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              ← Volver al historial
            </Link>
          </header>

          {/* FORMULARIO */}
          <section className="px-6 py-4 border-b border-slate-800 space-y-3">
            <form onSubmit={submit} className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                <input
                  className="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                  placeholder="Nombre de la categoría"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  required
                />

                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-cyan-400"
                    checked={form.activa}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, activa: e.target.checked }))
                    }
                  />
                  Activa
                </label>
              </div>

              <textarea
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                placeholder="Descripción (opcional)"
                rows={2}
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
                }
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs md:text-sm border-2 border-black bg-emerald-300 text-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-emerald-200 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-60"
                >
                  {saving
                    ? "Guardando…"
                    : editId
                    ? "Guardar cambios"
                    : "Crear categoría"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={startCreate}
                    className="px-3 py-2 text-xs border-2 border-black bg-slate-700 text-slate-100 shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-slate-600 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* TABLA */}
          <section className="px-4 py-4">
            <div className="overflow-auto">
              <table className="min-w-full text-[13px] leading-6">
                <thead className="bg-slate-900/70 border-b border-slate-800 text-slate-300 uppercase text-[11px]">
                  <tr>
                    <th className="p-3 text-left">Nombre</th>
                    <th className="p-3 text-left">Habilidades</th>
                    <th className="p-3 text-left">En uso activo</th>
                    <th className="p-3 text-left">Activa</th>
                    <th className="p-3 text-left w-48">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-300">
                        Cargando…
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">
                        Sin categorías
                      </td>
                    </tr>
                  ) : (
                    items.map((cat, idx) => (
                      <tr
                        key={cat.id}
                        className={
                          idx % 2 === 0 ? "bg-slate-950" : "bg-slate-900"
                        }
                      >
                        <td className="p-3 font-medium">{cat.nombre}</td>
                        <td className="p-3">{cat.habilidades_count ?? 0}</td>
                        <td className="p-3">
                          {cat.habilidades_activas_count ?? 0}
                        </td>
                        <td className="p-3">
                          {cat.activa ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] border border-emerald-400/60">
                              SÍ
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[11px] border border-slate-500">
                              NO
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="px-3 py-1 text-xs border-2 border-black bg-slate-200 text-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:bg-slate-100 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                              onClick={() => startEdit(cat)}
                            >
                              Editar
                            </button>
                            <button
                              className={`px-3 py-1 text-xs border-2 border-black text-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] ${
                                (cat.habilidades_activas_count ?? 0) > 0
                                  ? "bg-slate-500 cursor-not-allowed opacity-60"
                                  : "bg-rose-400 hover:bg-rose-300 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                              }`}
                              onClick={() => remove(cat)}
                              disabled={
                                (cat.habilidades_activas_count ?? 0) > 0
                              }
                              title={
                                (cat.habilidades_activas_count ?? 0) > 0
                                  ? "No se puede eliminar: tiene habilidades en uso activo"
                                  : ""
                              }
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
