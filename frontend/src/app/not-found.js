import React from 'react';
import Image from "next/image";
export default function Custom404() {
    return (
    <div className="bg-[#FFFFE1] h-screen flex flex-row items-center justify-center">
        <Image src="/pet/notFound404.png" alt="Respuesta" width={120} height={120} />
        <span className="text-3xl font-bold text-slate-600 m-4">|</span>
        <h1 className="text-3xl font-bold text-slate-600">Página no encontrada</h1>;
    </div>
    )
  }