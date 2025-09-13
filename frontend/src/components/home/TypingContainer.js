'use client';
import useAutoTyping  from "../../hooks/useAutoTyping.js";
import { motion } from "framer-motion";

export default function TypingContainer(){

    const displayedText = useAutoTyping('"Quiero aprender ' ,['tenis 🎾"', 'ajedrez ♟️"', 'actuación 🎭"'],"");

    return (
    <div className="text-2xl font-mono text-center mt-10">
      <motion.span
        key={displayedText}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {displayedText}
      </motion.span>
      <span className="animate-blink">|</span>

      <style jsx>{`
        .animate-blink {
          display: inline-block;
          margin-left: 2px;
          width: 10px;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}