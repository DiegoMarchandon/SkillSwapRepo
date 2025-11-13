'use client';
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import Subnavbar from "../../../components/perfil/Subnavbar";
import Header from '../../../components/layout/Header';
import HabilidadesSection from "../../../components/habilidades/HabilidadesSection";

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
    <div>
      <Header />
      <Subnavbar 
        actualTab={'Habilidades'}
      />

<HabilidadesSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cats={cats}
        loadingCats={loadingCats}
        form={form}
        setForm={setForm}
        submit={submit}
        error={error}
        disabled={disabled}
        list={list}
        loadingList={loadingList}
        changeNivel={changeNivel}
        toggleEstado={toggleEstado}
        remove={remove}
      />
    </div>
  );
}
