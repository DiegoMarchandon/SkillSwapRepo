'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PasswordDialog({ pwd, setPwd, onSubmitPassword, savingPwd, pwdMsg, pwdErr }) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="flex flex-col items-center mt-6 font-mono" style={{ fontFamily: 'VT323', letterSpacing: '1px', fontSize: '18px' }}>
      
      {/* Botón principal */}
      <button
        onClick={() => setShowDialog(true)}
        className="px-5 py-2 bg-[#bedbff] border-4 border-[#000] 
                   shadow-[3px_3px_0_#67E8F9] text-black text-[20px]
                   cursor-pointer hover:bg-[#c0e0e8] active:shadow-none"
      >
        Cambiar contraseña
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-[340px] bg-[#CDE8FF] border-4 border-[#222] 
                         shadow-[4px_4px_0_#67E8F9] p-4 text-[#111]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Encabezado */}
              <div className="flex justify-between items-center border-b-2 border-[#000] pb-1 mb-3">
                <h2 className="text-[22px]">Actualizar contraseña</h2>
                <button
                  onClick={() => setShowDialog(false)}
                  className="text-[#000] text-xl hover:text-red-600"
                >
                  ✖
                </button>
              </div>

              {/* Mensajes */}
              {pwdMsg && (
                <div className="mb-3 rounded border-2 border-[#000] bg-[#ccffcc] px-3 py-2 shadow-[2px_2px_0_#000]">
                  {pwdMsg}
                </div>
              )}
              {pwdErr && (
                <div className="mb-3 rounded border-2 border-[#000] bg-[#ffcccc] px-3 py-2 shadow-[2px_2px_0_#000]">
                  {pwdErr}
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={onSubmitPassword} className="grid gap-3">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  className="w-full rounded-none border-2 border-[#000] bg-[#e0ffe0] p-1 
                             shadow-[2px_2px_0_#000] focus:outline-none focus:bg-[#fff]"
                  value={pwd.current_password}
                  onChange={(e) => setPwd((s) => ({ ...s, current_password: e.target.value }))}
                />

                <label>Nueva contraseña</label>
                <input
                  type="password"
                  className="w-full rounded-none border-2 border-[#000] bg-[#e0ffe0] p-1 
                             shadow-[2px_2px_0_#000] focus:outline-none focus:bg-[#fff]"
                  value={pwd.password}
                  onChange={(e) => setPwd((s) => ({ ...s, password: e.target.value }))}
                />

                <label>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  className="w-full rounded-none border-2 border-[#000] bg-[#e0ffe0] p-1 
                             shadow-[2px_2px_0_#000] focus:outline-none focus:bg-[#fff]"
                  value={pwd.password_confirmation}
                  onChange={(e) => setPwd((s) => ({ ...s, password_confirmation: e.target.value }))}
                />

                <div className="flex justify-center gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={savingPwd}
                    className={`px-3 py-1 bg-[#66a366] border-2 border-[#000] shadow-[2px_2px_0_#000] 
                               text-white cursor-pointer hover:bg-[#77b377] active:shadow-none 
                               ${savingPwd ? 'opacity-60' : ''}`}
                  >
                    {savingPwd ? 'Actualizando…' : 'Actualizar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDialog(false)}
                    className="px-3 py-1 bg-[#dcdcdc] border-2 border-[#000] shadow-[2px_2px_0_#000] 
                               hover:bg-[#ececec] active:shadow-none"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
