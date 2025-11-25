import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function useAutoTyping(fixedText, words, initialValue = "") {
  const [displayedText, setDisplayedText] = useState(initialValue);
  const [isFixedTextDone, setIsFixedTextDone] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Animación para el texto fijo inicial
  useEffect(() => {
    if (!isFixedTextDone) {
      if (subIndex < fixedText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(fixedText.substring(0, subIndex + 1));
          setSubIndex(subIndex + 1);
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        setIsFixedTextDone(true);
        setSubIndex(0);
      }
    }
  }, [subIndex, isFixedTextDone]);

  // Animación para las palabras dinámicas
  useEffect(() => {
    if (!isFixedTextDone) return;

    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting && subIndex <= currentWord.length) {
      timeout = setTimeout(() => {
        setDisplayedText(fixedText + currentWord.substring(0, subIndex));
        setSubIndex(subIndex + 1);
      }, 150);
    } else if (isDeleting && subIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayedText(fixedText + currentWord.substring(0, subIndex));
        setSubIndex(subIndex - 1);
      }, 100);
    } else if (!isDeleting && subIndex > currentWord.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1000); // pausa antes de borrar
    } else if (isDeleting && subIndex < 0) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      setSubIndex(0);
    }

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, wordIndex, isFixedTextDone]);

  return displayedText;
}
