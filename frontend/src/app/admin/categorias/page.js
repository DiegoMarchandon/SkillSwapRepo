"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axios";

export default function AdminCategoriasPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // form simple (sirve para crear o editar)
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", activa: true });

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/admin/categorias"); // paginate
      setItems(res.data?.data ?? []);
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
    if (editId) await api.put(`/admin/categorias/${editId}`, payload);
    else await api.post(`/admin/categorias`, payload);
    startCreate();
    await load();
  }

  async function remove(cat) {
    if (!confirm(`¿Eliminar "${cat.nombre}"?`)) return;
    try {
      await api.delete(`/admin/categorias/${cat.id}`);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message ?? "No se pudo eliminar");
    }
  }

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <h2 className="text-3xl font-extrabold tracking-tight">Categorías</h2>

      {/* Formulario simple */}
      <form
        onSubmit={submit}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3 shadow-sm"
      >
        <div className="flex gap-3 items-start">
          <input
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 w-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            required
          />
          <label className="flex items-center gap-2 px-2 text-[15px]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-blue-600"
              checked={form.activa}
              onChange={(e) => setForm((f) => ({ ...f, activa: e.target.checked }))}
            />
            Activa
          </label>
        </div>
        <textarea
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 w-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Descripción (opcional)"
          rows={2}
          value={form.descripcion}
          onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
        />
        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            {editId ? "Guardar cambios" : "Crear categoría"}
          </button>
          {editId && (
            <button
              type="button"
              className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={startCreate}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla */}
      <div className="overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <table className="min-w-full text-[15px] leading-6">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-left font-semibold text-gray-700 dark:text-gray-200">
              <th className="p-3">Nombre</th>
              <th className="p-3">Habilidades</th>
              <th className="p-3">En uso activo</th>
              <th className="p-3">Activa</th>
              <th className="p-3 w-48">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/70 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  Cargando…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  Sin categorías
                </td>
              </tr>
            ) : (
              items.map((cat) => (
                <tr
                  key={cat.id}
                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 hover:bg-gray-100/70 dark:hover:bg-gray-700/60 transition-colors"
                >
                  <td className="p-3 font-medium">{cat.nombre}</td>
                  <td className="p-3">{cat.habilidades_count ?? 0}</td>
                  <td className="p-3">{cat.habilidades_activas_count ?? 0}</td>
                  <td className="p-3">{cat.activa ? "Sí" : "No"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500"
                        onClick={() => startEdit(cat)}
                      >
                        Editar
                      </button>
                      <button
                        className={`px-3 py-1 rounded-lg text-white ${
                          (cat.habilidades_activas_count ?? 0) > 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                        onClick={() => remove(cat)}
                        disabled={(cat.habilidades_activas_count ?? 0) > 0}
                        title={
                          (cat.habilidades_activas_count ?? 0) > 0
                            ? "No se puede eliminar: tiene habilidades en uso"
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
    </div>
  );
}
