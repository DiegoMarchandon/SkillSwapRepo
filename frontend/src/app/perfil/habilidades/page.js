'use client';
import { useEffect, useState } from 'react';
import api from '../../../utils/axios'; // ojo la ruta desde /perfil/habilidades

// Endpoints:
// GET    /api/my-skills?tipo=ofrecida|deseada
// POST   /api/my-skills { nombre, nivel, modalidad, tipo }
// PUT    /api/my-skills/:id { nombre?, nivel?, modalidad? }
// DELETE /api/my-skills/:id

const niveles = ['principiante', 'intermedio', 'avanzado'];
const modalidades = ['online', 'presencial'];

export default function HabilidadesPage() {
  const [tipo, setTipo] = useState('ofrecida'); // 'ofrecida' | 'deseada'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: '',
    nivel: 'principiante',
    modalidad: 'online',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // Edición
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', nivel: 'principiante', modalidad: 'online' });
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get('/api/my-skills', { params: { tipo } });
      setItems(Array.isArray(data) ? data : (data?.data || []));
    } catch {
      setErr('No se pudieron cargar las habilidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tipo]);

  const addSkill = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      await api.post('/api/my-skills', { ...form, tipo });
      setForm({ nombre: '', nivel: 'principiante', modalidad: 'online' });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'No se pudo agregar');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setEditForm({
      nombre: it.nombre || it.name || '',
      nivel: it.nivel || 'principiante',
      modalidad: it.modalidad || 'online',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ nombre: '', nivel: 'principiante', modalidad: 'online' });
  };

  const saveEdit = async (id) => {
    if (!editForm.nombre.trim()) return;
    setSavingEdit(true);
    try {
      await api.put(`/api/my-skills/${id}`, {
        nombre: editForm.nombre,
        nivel: editForm.nivel,
        modalidad: editForm.modalidad,
        tipo,
      });
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo editar');
      const errs = e?.response?.data?.errors;
      if (errs) {
        const k = Object.keys(errs)[0];
        alert(errs[k][0]);
      } else {
        alert(e?.response?.data?.message || 'No se pudo editar');
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const removeSkill = async (id) => {
    if (!confirm('¿Eliminar habilidad?')) return;
    try {
      await api.delete(`/api/my-skills/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      alert('No se pudo eliminar');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-gray-900 rounded-2xl shadow">
      <h2 className="mb-4 text-xl font-semibold">Habilidades</h2>

      {/* Toggle ofrecida / deseada */}
      <div className="mb-4 inline-flex rounded-full border border-gray-300 overflow-hidden">
        {['ofrecida', 'deseada'].map(t => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`px-4 py-2 ${tipo === t ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
          >
            {t === 'ofrecida' ? 'Ofrecidas' : 'Deseadas'}
          </button>
        ))}
      </div>

      {/* Alta */}
      <form onSubmit={addSkill} className="mb-6 grid gap-2 md:grid-cols-4">
        <input
          placeholder="Nombre (p. ej. JavaScript)"
          className="rounded border p-2 md:col-span-2"
          value={form.nombre}
          onChange={e => setForm(s => ({ ...s, nombre: e.target.value }))}
        />
        <select
          className="rounded border p-2"
          value={form.nivel}
          onChange={e => setForm(s => ({ ...s, nivel: e.target.value }))}
        >
          {niveles.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select
          className="rounded border p-2"
          value={form.modalidad}
          onChange={e => setForm(s => ({ ...s, modalidad: e.target.value }))}
        >
          {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button
          disabled={saving}
          className={`mt-2 md:mt-0 rounded bg-blue-600 px-4 py-2 text-white ${saving ? 'opacity-60' : ''}`}
        >
          {saving ? 'Agregando…' : 'Agregar'}
        </button>
      </form>

      {err && <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      {/* Lista */}
      {loading ? (
        <p>Cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No tenés habilidades {tipo === 'ofrecida' ? 'ofrecidas' : 'deseadas'} aún.</p>
      ) : (
        <ul className="divide-y">
          {items.map(it => (
            <li key={it.id} className="py-3">
              {editingId === it.id ? (
                <div className="grid gap-2 md:grid-cols-4 items-center">
                  <input
                    className="rounded border p-2 md:col-span-2"
                    value={editForm.nombre}
                    onChange={e => setEditForm(s => ({ ...s, nombre: e.target.value }))}
                  />
                  <select
                    className="rounded border p-2"
                    value={editForm.nivel}
                    onChange={e => setEditForm(s => ({ ...s, nivel: e.target.value }))}
                  >
                    {niveles.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <select
                    className="rounded border p-2"
                    value={editForm.modalidad}
                    onChange={e => setEditForm(s => ({ ...s, modalidad: e.target.value }))}
                  >
                    {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => saveEdit(it.id)}
                      disabled={savingEdit}
                      className={`rounded bg-green-600 px-3 py-1.5 text-white ${savingEdit ? 'opacity-60' : ''}`}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      type="button"
                      className="rounded bg-gray-200 px-3 py-1.5"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{it.nombre || it.name}</p>
                    <p className="text-sm text-gray-600">
                      Nivel: {it.nivel} • Modalidad: {it.modalidad}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(it)}
                      className="rounded bg-yellow-500 px-3 py-1.5 text-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => removeSkill(it.id)}
                      className="rounded bg-red-600 px-3 py-1.5 text-white"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
