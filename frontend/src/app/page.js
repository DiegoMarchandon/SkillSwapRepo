"use client";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div style={{display:"flex", backgroundColor:"000000",justifyContent:"center",alignItems:"center",width:"100%",height:"100%",gap:20}}>
      <h1>Plantilla </h1>
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
