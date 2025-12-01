import { motion } from "framer-motion";
import Image from "next/image";

/**
 * A rotating square with a skill icon, to be used in the SkillGrid component.
 * @param {Object} props Component props.
 * @param {string} props.skillPNG URL of the PNG image to be used as the skill icon.
 * @returns {React.ReactElement} The rendered component.
 */
export default function SkillCard({skillPNG, className="", style={}, ...props }){
    return (
        <motion.div
          whileHover={{ 
            scale: 1.3, 
          }}
          className={`w-[60px] h-[60px] rounded-[5px] ${className}`}
          style={style}
          {...props}
          animate={{rotate:360}}
          transition={{
            scale: { duration: 0.2 }, rotate: {
              repeat: Infinity, 
              repeatDelay: 0, 
              ease: "easeInOut",
              duration: 10
            }
          }}
          >
          <Image
            src={skillPNG}
            alt="Skill Icon"
            width={60}
            height={60}
          />
        </motion.div>
    );
}