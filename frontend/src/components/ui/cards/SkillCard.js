import { motion } from "framer-motion";


export default function SkillCard({skillSVG}){
    return (
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
    );
}