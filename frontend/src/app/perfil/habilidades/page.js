'use client';
import { useEffect, useState } from "react";
import api from "@/utils/axios";

export default function MisHabilidades() {
  const [cats, setCats] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [activeTab, setActiveTab] = useState("ofrecida");
  const [items, setItems] = useState({ ofrecida: [], deseada: [] });
  const [loadingList, setLoadingList] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    tipo: "ofrecida",
    nivel: "principiante",
    categoria_id: "",
  });
  const [error, setError] = useState("");

  async function loadCats() {
    setLoadingCats(true);
    try {
      const res = await api.get("/categorias", { params: { activa: 1 } });
      const b = res?.data;
      const arr = Array.isArray(b) ? b : Array.isArray(b?.data) ? b.data : [];
      setCats(arr);
    } finally {
      setLoadingCats(false);
    }
  }

  async function loadList(tipo) {
    setLoadingList(true);
    try {
      const r = await api.get("/my-skills", { params: { tipo } });
      setItems(prev => ({ ...prev, [tipo]: Array.isArray(r.data) ? r.data : [] }));
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadCats();
    loadList("ofrecida");
  }, []);

  useEffect(() => {
    setForm(f => ({ ...f, tipo: activeTab }));
    loadList(activeTab);
  }, [activeTab]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/my-skills", {
        nombre: form.nombre,
        tipo: form.tipo,
        nivel: form.nivel,
        categoria_id: Number(form.categoria_id),
      });
      setForm(f => ({ ...f, nombre: "", categoria_id: "" }));
      await loadList(form.tipo);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        Object.values(err?.response?.data?.errors ?? {})[0]?.[0] ??
        "No se pudo agregar";
      setError(msg);
    }
  }

  async function remove(id) {
    setError("");
    try {
      await api.delete(`/my-skills/${id}`);
      await loadList(activeTab);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "No se pudo eliminar";
      setError(msg);
    }
  }

  async function toggleEstado(row) {
    try {
      await api.put(`/my-skills/${row.id}`, { tipo: activeTab, estado: !row.estado });
      await loadList(activeTab);
    } catch {}
  }

  async function changeNivel(row, nivel) {
    try {
      await api.put(`/my-skills/${row.id}`, { tipo: activeTab, nivel });
      await loadList(activeTab);
    } catch {}
  }

  const list = items[activeTab] ?? [];
  const disabled = !form.nombre || !form.categoria_id || loadingCats;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Habilidades
        </h2>

        <div className="mt-4 inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {["ofrecida", "deseada"].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={[
                "px-4 py-2 text-sm font-medium rounded-lg transition",
                activeTab === t
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",
              ].join(" ")}
            >
              {t === "ofrecida" ? "Ofrecidas" : "Deseadas"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Habilidad
            </label>
            <input
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej.: Laravel, Guitarra…"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none ring-2 ring-transparent transition focus:border-zinc-400 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-700"
              required
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Categoría
            </label>
            <select
              value={form.categoria_id}
              onChange={(e) => setForm((f) => ({ ...f, categoria_id: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none ring-2 ring-transparent transition focus:border-zinc-400 focus:ring-zinc-200 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-700"
              disabled={loadingCats || cats.length === 0}
              required
            >
              <option value="" disabled>
                {loadingCats ? "Cargando..." : cats.length ? "Elegí una categoría" : "Sin categorías activas"}
              </option>
              {(Array.isArray(cats) ? cats : []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nivel
            </label>
            <select
              value={form.nivel}
              onChange={(e) => setForm((f) => ({ ...f, nivel: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none ring-2 ring-transparent transition focus:border-zinc-400 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-700"
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>

          <div className="md:col-span-12">
            <button
              type="submit"
              disabled={disabled}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Agregar
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {activeTab === "ofrecida" ? "Habilidades ofrecidas" : "Habilidades deseadas"}
        </h3>

        {loadingList ? (
          <div className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300">Cargando…</div>
        ) : list.length === 0 ? (
          <div className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300">No tenés habilidades {activeTab === "ofrecida" ? "ofrecidas" : "deseadas"} aún.</div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {list.map((row) => (
              <li key={row.id} className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{row.name}</div>
                    <div className="mt-1 flex items-center gap-3">
                      <select
                        value={row.nivel}
                        onChange={(e) => changeNivel(row, e.target.value)}
                        className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>

                      <button
                        onClick={() => toggleEstado(row)}
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-medium transition",
                          row.estado
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                        ].join(" ")}
                        title={row.estado ? "Desactivar" : "Activar"}
                      >
                        {row.estado ? "Activa" : "Inactiva"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => remove(row.id)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
