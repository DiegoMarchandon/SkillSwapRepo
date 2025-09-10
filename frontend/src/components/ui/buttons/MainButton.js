import { motion } from "framer-motion";

export default function MainButton({text}) {
    return (
        <motion.button
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
            {text}
        </motion.button>
    );
}