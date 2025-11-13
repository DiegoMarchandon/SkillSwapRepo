'use client';
import { motion } from 'framer-motion';

export default function LavaLampBackground() {
  const blobs = Array.from({ length: 6 });

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
      
      {blobs.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-screen blur-[120px] opacity-40 backdrop-blur-0"
          style={{
            backgroundColor: `hsl(${i * 60 + 180}, 80%, 60%)`,
            width: `${180 + Math.random() * 180}px`,
            height: `${180 + Math.random() * 180}px`,
          }}
          animate={{
            x: [0, 200, -200, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 10 + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

