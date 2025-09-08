"use client";
import { motion } from "framer-motion";
import Home from "../components/layout/Home";
import Footer from "../components/layout/Footer";
import {VT323 } from 'next/font/google';

export const vt323 = VT323({weight:"400",subsets:["latin"], variable:"--font-vt323"});

export default function MyApp() {
  return (
    <div className="h-screen flex items-center justify-center text-white">

      <div className="h-screen flex items-start justify-center">
        {/* <h1 className={`${vt323.className} font-pixel text-4xl text-center`}>SkillSwap</h1> */}
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
      <motion.button
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Haz click aqui
      </motion.button>

      <Footer />
    </div>
  );
}
