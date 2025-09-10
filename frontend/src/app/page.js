"use client";
import { motion } from "framer-motion";
import Home from "../components/layout/Home";

import {VT323 } from 'next/font/google';

export const vt323 = VT323({weight:"400",subsets:["latin"], variable:"--font-vt323"});

export default function MyApp() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">

      <div className="h-screen flex items-start justify-center">
        <Home />
      </div>
      

      {/* <Footer /> */}
    </div>
  );
}
