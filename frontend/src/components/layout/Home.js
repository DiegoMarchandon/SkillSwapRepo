import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import SkillCard from "../ui/cards/SkillCard";
import { useAnimationFrame, useMotionValue } from "framer-motion";
import OrbitFunction from "../../utils/mathUtils";
import { useState, useEffect } from "react";
import TypingContainer from "../home/TypingContainer";

function Home() {

  // Generamos coordenadas base (ángulos iniciales)
  const [positions, setPositions] = useState([]);
  const [tick, setTick] = useState(0);  // Estado para forzar re-render y actualizar zIndex

//   const positions = OrbitFunction(9, 225, 150);
useEffect(() => {
  setPositions(OrbitFunction(9, 225, 150));
}, []);

  // MotionValue para la rotación global
  const rotateZ = useMotionValue(0);

  // Actualizamos el ángulo de rotación continuamente
  useAnimationFrame((t, delta) => {
    const degreesPerSecond = 18; // 360° en 10s
    rotateZ.set((rotateZ.get() + (degreesPerSecond * delta) / 1000) % 360);
    setTick(prev => prev + 1); // fuerza re-render
  });

  const images = [
    "/skillsPNGs/dancing.png",
    "/skillsPNGs/guitar.png",
    "/skillsPNGs/karaoke.png",
    "/skillsPNGs/Literatura.png",
    "/skillsPNGs/Magia.png",
    "/skillsPNGs/Matematicas.png",
    "/skillsPNGs/Programacion.png",
    "/skillsPNGs/translate.png",
    "/skillsPNGs/Veterinario.png"
  ];

  return (
    <div>
      <Header />
      <div className="h-screen flex items-center justify-center text-4xl">
        <div className="relative w-[400px] h-[400px] flex items-center justify-center">

          {/* Texto central */}
          <h1 style={{fontFamily: 'VT323',left: "50%",top: "50%",transform: "translate(-50%, -50%)"}}className="absolute z-10 text-9xl">
            SkillSwap
          </h1>

          {/* Cards girando */}
          {positions.map(({ angle }, index) => {
            // Convertimos grados de rotateZ a radianes y sumamos al ángulo inicial
            const currentAngle = angle + (rotateZ.get() * Math.PI / 180);
            
            // Calculamos posición según radioX y radioY
            const currentX = Math.cos(currentAngle) * 225; // radiusX
            const currentY = Math.sin(currentAngle) * 150; // radiusY

            return (
              <SkillCard
                key={index}
                skillPNG={images[index % images.length]}
                style={{ left: `calc(50% + ${currentX}px)`, top: `calc(50% + ${currentY}px)`,
                  transform: "translate(-50%, -50%)", zIndex: currentX > -150 ? 20 : -10, // dinámico: pasa por delante/detrás
                  position: "absolute"
                }}
              />
            );
          })}

        </div>
      </div>
          <div className="h-14.5">
            <TypingContainer />
          </div>
      <Footer />
    </div>
  );
}

export default Home;
