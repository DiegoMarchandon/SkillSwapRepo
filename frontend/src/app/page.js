"use client";
import { motion } from "framer-motion";
import Home from "./layout/Home";
// import {VT323 } from 'next/font/google';

// export const vt323 = VT323({weight:"400",subsets:["latin"], variable:"--font-vt323"});

export default function MyApp() {
  return (
    <div className="h-screen flex items-center justify-center text-white">

      <div className="h-screen flex items-start justify-center">
        <h1 className="font-pixel text-4xl text-center">SkillSwap</h1>
        {/* className={`${vt323.className} font-pixel text-4xl text-center`} */}
        <Home />
      </div>

      <motion.div
      style={{
        width:100,
        height:100,
        backgroundColor:"#ff0088",
        borderRadius:5
      }}
      animate={{rotate:360}}
      transition={{duration:2}}
      />
    </div>
  );
}
