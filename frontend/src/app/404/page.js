'use client';
import { useAnimationFrame, useMotionValueEvent, useMotionValue, motion } from "framer-motion";
import { useState } from "react";
import LavaLampBackground from '../../components/perfil/LavaLampBackground';

export default function testing(){
    

return (
    <div className="mt-[20vw] flex flex-col justify-center items-center">
        <LavaLampBackground />
        
        <p>hola</p>
    </div>

);
}