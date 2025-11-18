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
    <div className="min-h-screen bg-gray-900">
      {/* Fondo consistente */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/30 to-cyan-900/20 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Título principal actualizado */}
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-4xl font-bold text-center text-white font-mono pixel-text"
          style={{ 
            fontFamily: 'VT323, monospace',
            textShadow: '2px 2px 0 #000, 4px 4px 0 rgba(103, 232, 249, 0.3)',
            letterSpacing: '2px'
          }}
        >
          HABILIDADES
        </motion.h2>

        <div className="relative bg-gray-800 border-4 border-gray-700 p-8 backdrop-blur-sm bg-opacity-90"
             style={{ boxShadow: '8px 8px 0 #000' }}>

          {/* Tabs pixeladas - ACTUALIZADO */}
          <div className="mt-4 flex justify-center gap-6">
            {["ofrecida", "deseada"].map((t) => (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                key={t}
                onClick={() => setActiveTab(t)}
                className={`relative px-6 py-3 rounded-none border-4 font-mono text-lg font-bold transition-all duration-200
                  ${
                    activeTab === t
                      ? "bg-cyan-500 text-gray-900 border-cyan-700 shadow-inner"
                      : "bg-gray-600 text-white border-gray-800 hover:bg-gray-500"
                  }`}
                style={{ 
                  boxShadow: activeTab === t ? 'inset 3px 3px 0 #000' : '4px 4px 0 #000',
                  fontFamily: 'VT323, monospace'
                }}
              >
                {t === "ofrecida" ? "OFRECIDAS" : "DESEADAS"}
              </motion.button>
            ))}
          </div>

          {/* ➕ Formulario - ACTUALIZADO */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-6 border-4 border-gray-700 bg-gray-700/80 backdrop-blur-md p-6 flex flex-col md:flex-row gap-4 items-center justify-center"
            style={{ boxShadow: '6px 6px 0 #000' }}
          >
            <input
              type="text"
              placeholder="NUEVA HABILIDAD"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="w-full md:w-1/3 bg-gray-200 border-4 border-gray-800 text-gray-900 text-lg rounded-none px-4 py-3 placeholder:text-gray-600 focus:outline-none font-mono"
              style={{ 
                fontFamily: 'VT323, monospace',
                boxShadow: '3px 3px 0 #000',
                letterSpacing: '1px'
              }}
            />

            <select
              value={form.categoria_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoria_id: e.target.value }))
              }
              disabled={loadingCats}
              className="w-full md:w-1/3 bg-gray-200 border-4 border-gray-800 text-gray-900 rounded-none px-4 py-3 focus:outline-none font-mono text-lg"
              style={{ 
                fontFamily: 'VT323, monospace',
                boxShadow: '3px 3px 0 #000',
                letterSpacing: '1px'
              }}
            >
              <option value="">CATEGORÍA</option>
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={form.nivel}
              onChange={(e) => setForm((f) => ({ ...f, nivel: e.target.value }))}
              className="w-full md:w-1/3 bg-gray-200 border-4 border-gray-800 text-gray-900 rounded-none px-4 py-3 font-mono text-lg"
              style={{ 
                fontFamily: 'VT323, monospace',
                boxShadow: '3px 3px 0 #000',
                letterSpacing: '1px'
              }}
            >
              <option value="principiante">PRINCIPIANTE</option>
              <option value="intermedio">INTERMEDIO</option>
              <option value="avanzado">AVANZADO</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={disabled}
              type="submit"
              className={`border-4 font-mono text-lg font-bold px-6 py-3 rounded-none
                ${disabled
                  ? "bg-gray-500 text-gray-300 border-gray-600 cursor-not-allowed"
                  : "bg-cyan-500 text-gray-900 border-cyan-700 hover:bg-cyan-400"
                }`}
              style={{ 
                boxShadow: disabled ? 'none' : '4px 4px 0 #000',
                fontFamily: 'VT323, monospace'
              }}
            >
              AGREGAR
            </motion.button>
          </motion.form>

          {/* Cuadro contenedor arrastrable - ACTUALIZADO */}
          <motion.div
            ref={constraintsRef}
            className="relative mt-4 w-full min-h-[400px] border-4 border-gray-700 bg-gray-700/60 backdrop-blur-md overflow-hidden flex flex-wrap justify-center items-center gap-6 p-8"
            style={{ boxShadow: '6px 6px 0 #000' }}
          >
            {loadingList ? (
              <p className="text-white font-mono text-xl">CARGANDO…</p>
            ) : list.length === 0 ? (
              <p className="text-gray-400 font-mono text-xl text-center">
                NO TENÉS HABILIDADES {activeTab === "ofrecida" ? "OFRECIDAS" : "DESEADAS"} AÚN.
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
                  className="relative w-56 h-36 bg-gradient-to-br from-cyan-500 to-blue-500 border-4 border-cyan-700 shadow-lg rounded-none flex flex-col justify-between items-center p-4 cursor-grab"
                  style={{ boxShadow: '4px 4px 0 #000' }}
                >
                  <h4 className="text-gray-900 font-mono text-lg font-bold text-center break-words"
                      style={{ fontFamily: 'VT323, monospace' }}>
                    {row.name.toUpperCase()}
                  </h4>

                  <div className="w-full flex flex-col gap-3 items-center">
                    <select
                      value={row.nivel}
                      onChange={(e) => changeNivel(row, e.target.value)}
                      className="bg-white/90 text-gray-900 border-2 border-gray-800 font-mono text-sm rounded-none py-1 w-full text-center focus:outline-none"
                      style={{ fontFamily: 'VT323, monospace' }}
                    >
                      <option value="principiante">PRINCIPIANTE</option>
                      <option value="intermedio">INTERMEDIO</option>
                      <option value="avanzado">AVANZADO</option>
                    </select>

                    <button
                      onClick={() => toggleEstado(row)}
                      className={`text-sm font-bold rounded-none w-full border-2 border-gray-800 py-1 font-mono
                        ${row.estado
                          ? "bg-green-500 text-gray-900"
                          : "bg-gray-500 text-white"
                        }`}
                      style={{ 
                        fontFamily: 'VT323, monospace',
                        boxShadow: '2px 2px 0 #000'
                      }}
                    >
                      {row.estado ? "ACTIVA" : "INACTIVA"}
                    </button>

                    <button
                      onClick={() => remove(row.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-none border-2 border-red-700 px-2 py-1 hover:bg-red-600 font-mono text-xs font-bold"
                      style={{ boxShadow: '2px 2px 0 #000' }}
                    >
                      ✖
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-none border-4 border-red-500 bg-red-900/50 px-6 py-4 text-white font-mono text-lg"
              style={{ boxShadow: '4px 4px 0 #000' }}
            >
              {error}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
