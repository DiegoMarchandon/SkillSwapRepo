'use client';
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";

export default function PixelDNI({ u, onSubmitProfile, setU, fieldErrs, saving, onRestore, avatarPreview }) {

  const [isHover, setIsHover] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();
  
  useEffect(() => {
    const interval = setInterval(() => {
      controls.start({
        x: ["-200%", "315%"],
        transition: { duration: 1.8, ease: "easeInOut" },
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [controls]);

  // Rotación en base a posición del cursor
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);
//   const scale = useTransform(isHover ? 1.05 : 1);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    x.set(offsetX);
    y.set(offsetY);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full">
  
  
      {/* Contenedor principal con efecto de profundidad y brillo */}
      <motion.form
        onSubmit={onSubmitProfile}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => { setIsHover(false); x.set(0); y.set(0); }}
        style={{
          rotateX,
          rotateY,
          fontFamily: 'VT323',
          letterSpacing: '1px',
          fontSize: '18px',
        }}
        animate={{ scale: isHover ? 1.05 : 1 }}
        className="relative w-[340px] h-[255px] overflow-hidden 
                   bg-[#CDE8FF] border-4 border-[#222] shadow-[4px_4px_0_#67E8F9] 
                   font-mono text-sm tracking-tight pixelated p-4 grid grid-cols-2 gap-3"
      >
        {/* Fondo del DNI */}
        <img src="/dni-bg.png" onError={(e) => (e.currentTarget.style.display = 'none')} className="absolute inset-0 w-full h-full object-cover opacity-80" />
  
        {/* Efecto de brillo */}
        <motion.div
          className="absolute top-[-75%] left-[-50%] w-[50%] h-[200%] 
                     bg-gradient-to-r from-transparent via-white/50 to-transparent 
                     rotate-[25deg] z-20 pointer-events-none"
          animate={controls}
        />
  
        {/* Contenido del DNI */}
        <div className="relative z-10 col-span-2 flex gap-3">
          {/* Imagen de perfil */}
          <img
            src={
              avatarPreview ||
              (u.avatar_path && `${process.env.NEXT_PUBLIC_API_URL}${u.avatar_path}`) ||
              '/default-avatar.png'
            }
            alt="avatar preview"
            className="h-28 w-28 rounded-[8px] object-cover border border-[#000] shadow-[2px_2px_0_#000]"
          />
  
          {/* Datos del usuario */}
          <div className="flex flex-col justify-center text-[#111] flex-1">
            <p className="text-md mb-2 select-none border-b border-[#000] bg-white/60 px-2 rounded">
              ID Estudiante: {u.id}
            </p>
  
            <label className="block text-[18px]">Nombre</label>
            <input
              className="w-full rounded-none border border-[#000] bg-[#e0ffe0] p-1 
                         shadow-[2px_2px_0_#000] focus:outline-none focus:bg-[#fff]"
              value={u.name}
              onChange={(e) => setU((s) => ({ ...s, name: e.target.value }))}
            />
            {fieldErrs.name && (
              <p className="text-xs text-red-600">{fieldErrs.name[0]}</p>
            )}
  
            <label className="block mt-1 text-[18px]">Email</label>
            <input
              className="w-full rounded-none border border-[#000] bg-[#e0ffe0] p-1 
                         shadow-[2px_2px_0_#000] focus:outline-none focus:bg-[#fff]"
              value={u.email}
              onChange={(e) => setU((s) => ({ ...s, email: e.target.value }))}
            />
            {fieldErrs.email && (
              <p className="text-xs text-red-600">{fieldErrs.email[0]}</p>
            )}
          </div>
        </div>
  
        {/* Botones al pie del DNI */}
        <div className="relative z-10 col-span-2 mt-3 flex justify-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`px-3 py-1 bg-[#66a366] border-2 border-[#000] shadow-[2px_2px_0_#000] 
                       text-white cursor-pointer hover:bg-[#77b377] active:shadow-none 
                       ${saving ? 'opacity-60' : ''}`}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
  
          <button
            type="button"
            onClick={onRestore}
            className="px-3 py-1 bg-gray-400 border-2 border-[#000] shadow-[2px_2px_0_#000] 
                       hover:bg-[#baabab] active:shadow-none"
          >
            Restaurar
          </button>
        </div>
      </motion.form>
    </div>
  );
  
}
