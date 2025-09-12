import { motion } from "framer-motion";

/* funciones matemáticas. */

/**
 * función para calcular la distribución 
 * equidistante de N elementos en un círculo, y su ángulo.
 * @param {number} count - cantidad de elementos
 * @param {number} radiusX - radio del eje X del círculo en px
 * @param {number} radiusY - radio del eje Y del círculo en px
 * @return {Array} coordenadas y ángulo [{x,y,angle},...]
 */
export default function OrbitFunction(count, radiusX, radiusY) {
    const coordinates = []; // arreglo para almacenar las coordenadas

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI; // ángulo en radianes
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY;
        coordinates.push({ x, y, angle });
      }
    
      return coordinates;
    }