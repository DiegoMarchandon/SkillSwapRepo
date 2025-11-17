"use client";
import { useRef } from "react";
import { motion } from "framer-motion";

export default function HabilidadesSection({
  activeTab,
  setActiveTab,
  list,
  loadingList,
  error,
  remove,
  toggleEstado,
  changeNivel,
  cats,
  loadingCats,
  form,
  setForm,
  submit,
  disabled
}) {
  const constraintsRef = useRef(null);

  return (
    <div className="relative z-20 mt-[4.5rem] max-w-5xl mx-auto p-6 w-full font-pixel text-sm select-none">
      <div className="rounded-2xl border-2 border-[#0f172a] bg-[#cde8ff]/20 p-5 shadow-lg backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
         Habilidades
        </h2>

        {/* Tabs pixeladas */}
        <div className="mt-4 flex justify-center gap-4">
          {["ofrecida", "deseada"].map((t) => (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              key={t}
              onClick={() => setActiveTab(t)}
              className={`relative px-4 py-2 rounded-md border-2 border-[#0f172a] transition-all duration-200
                ${
                  activeTab === t
                    ? "bg-[#8FD0FF] text-[#0f172a] shadow-inner"
                    : "bg-transparent text-[#0b0c10] hover:bg-[#cde8ff]/60"
                }`}
            >
              {t === "ofrecida" ? "Ofrecidas" : "Deseadas"}
            </motion.button>
          ))}
        </div>

        {/* ➕ Formulario para agregar nuevas habilidades */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 mb-6 border-2 border-[#0f172a] bg-[#ffffff1a] backdrop-blur-md rounded-2xl p-5 flex flex-col md:flex-row gap-3 items-center justify-center"
        >
          <input
            type="text"
            placeholder="Nueva habilidad"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            className="w-full md:w-1/3 bg-[#cde8ff]/70 border-2 border-[#0f172a] text-[#0f172a] text-[10px] rounded-md px-3 py-2 placeholder:text-[#0f172a]/60 focus:outline-none focus:ring-2 focus:ring-[#8FD0FF]"
          />

          <select
            value={form.categoria_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoria_id: e.target.value }))
            }
            disabled={loadingCats}
            className="w-full md:w-1/3 bg-[#cde8ff]/70 border-2 border-[#0f172a] text-[#0f172a] rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-[#8FD0FF]"
          >
            <option value="">categoria</option>
            {cats.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>

          <select
            value={form.nivel}
            onChange={(e) => setForm((f) => ({ ...f, nivel: e.target.value }))}
            className="w-full md:w-1/3 bg-[#cde8ff]/70 border-2 border-[#0f172a] text-[#0f172a] rounded-md px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8FD0FF]"
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled}
            type="submit"
            className={`border-2 border-[#0f172a] rounded-md px-4 py-2 font-medium ${
              disabled
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-[#8FD0FF] text-[#0f172a] hover:bg-[#9FD9FF]"
            }`}
          >
            Agregar
          </motion.button>
        </motion.form>

        {/* Cuadro contenedor arrastrable */}
        <motion.div
          ref={constraintsRef}
          className="relative mt-4 w-full min-h-[300px] rounded-2xl border-2 border-[#0f172a] bg-[#ffffff1a] backdrop-blur-md overflow-hidden flex flex-wrap justify-center items-center gap-4 p-6"
        >
          {loadingList ? (
            <p className="text-[#0f172a]">Cargando…</p>
          ) : list.length === 0 ? (
            <p className="text-[#0f172a]">
              No tenés habilidades{" "}
              {activeTab === "ofrecida" ? "ofrecidas" : "deseadas"} aún.
            </p>
          ) : (
            list.map((row) => (
              <motion.div
                key={row.id}
                drag
                dragConstraints={constraintsRef}
                dragElastic={0.15}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-50 h-32 bg-[#cde8ff]/70 border-2 border-[#0f172a] shadow-lg rounded-md flex flex-col justify-between items-center p-3 cursor-grab"
              >
                <h4 className="text-[#0f172a] text-sm text-center break-words">
                  {row.name}
                </h4>

                <div className="w-full flex flex-col gap-2 items-center">
                  <select
                    value={row.nivel}
                    onChange={(e) => changeNivel(row, e.target.value)}
                    className="bg-white/60 text-[#1E7187] border border-[#0f172a] text-xs rounded-md py-1 w-full text-center focus:outline-none"
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>

                  <button
                    onClick={() => toggleEstado(row)}
                    className={`text-xs font-medium rounded-md w-full border-2 border-[#0f172a] py-1 ${
                      row.estado
                        ? "bg-[#8FD0FF] text-[#0f172a]"
                        : "bg-transparent text-[#0b0c10]"
                    }`}
                  >
                    {row.estado ? "Activa" : "Inactiva"}
                  </button>

                  <button
                    onClick={() => remove(row.id)}
                    className="absolute top-1 right-1 text-[10px] bg-red-600 text-white rounded-sm px-2 py-[1px] hover:bg-red-700"
                  >
                    ✖
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {error && (
          <div className="mt-4 rounded-md border-2 border-red-400 bg-red-100/30 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
