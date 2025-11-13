'use client';
import { motion } from "framer-motion";
import Link from "next/link";

export default function PixelCornerButton({ href, active, label, actualTab }) {
  let isActive = label === actualTab;
    return (
        <motion.div
          initial="rest"
          whileHover="hover"
          animate="rest"
          className="relative w-fit h-fit"
        >
          {/* Fondo con blur y transición */}
          <motion.div
            variants={{
              rest: {
                backgroundColor: isActive ? "rgba(205, 232, 255, 0.9)" : "rgba(255,255,255,0.1)",
                backdropFilter: isActive ? "blur(8px)" : "blur(3px)",
              },
              hover: { backgroundColor: "rgba(205, 232, 255, 0.9)", backdropFilter: "blur(8px)" },
            }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          />
    
          {/* Esquinas iniciales */}
          <motion.span
            className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#0f172a]"
          />
          <motion.span
            className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#0f172a]"
          />
    
          {/* Líneas animadas (se dibujan al hover) */}
          {/* Superior */}
          <motion.span
            variants={{
              rest: { scaleX: 0 },
              hover: { scaleX: 1 },
            }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 h-[2px] bg-[#0f172a] origin-left w-full"
          />
          {/* Derecha */}
          <motion.span
            variants={{
              rest: { scaleY: 0 },
              hover: { scaleY: 1 },
            }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="absolute top-0 right-0 w-[2px] bg-[#0f172a] origin-top h-full"
          />
          {/* Inferior */}
          <motion.span
            variants={{
              rest: { scaleX: 0 },
              hover: { scaleX: 1 },
            }}
            transition={{ delay: 0.3, duration: 0.2 }}
            className="absolute bottom-0 left-0 h-[2px] bg-[#0f172a] origin-right w-full"
          />
          {/* Izquierda */}
          <motion.span
            variants={{
              rest: { scaleY: 0 },
              hover: { scaleY: 1 },
            }}
            transition={{ delay: 0.45, duration: 0.2 }}
            className="absolute top-0 left-0 w-[2px] bg-[#0f172a] origin-bottom h-full"
          />
    
          {/* Texto */}
          <Link
            href={href}
            className={`relative z-10 px-5 py-2 font-pixel text-xs uppercase tracking-wider transition-colors duration-300 ${
              active
                ? 'text-[#0f172a]'
                : 'text-[#0b0c10] hover:text-[#0f172a]'
            }`}
          >
            {label}
          </Link>
        </motion.div>
      );
}
