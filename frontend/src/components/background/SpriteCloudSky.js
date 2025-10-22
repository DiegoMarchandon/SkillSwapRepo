// components/background/SpriteCloudSky.jsx
import { motion } from 'framer-motion';
import './SpriteCloudSky.css';

const SpriteCloudSky = () => {
  const cloudVariants = {
    animate: (custom) => ({
      x: ['-200px', 'calc(100vw + 200px)'],
      transition: {
        duration: custom.duration,
        repeat: Infinity,
        repeatType: 'loop',
        delay: custom.delay,
        ease: 'linear',
      },
    }),
  };

  return (
    <div className='pixel-sky-bg'>
      {/* nube pequeña + esponjosa */}
      <motion.div
        initial={{ left: '-100px' }}
        custom={{ duration: 45, delay: 0 }}
        variants={cloudVariants}
        animate="animate"
        className='cloud-sprite cloud-fluffy'
        style={{ top: '20%' }}
      />
      {/* nube grande + orgánica */}
      <motion.div
        initial={{ left: '-170px' }}
        custom={{ duration: 65, delay: -10 }}
        variants={cloudVariants}
        animate="animate"
        className='cloud-sprite cloud-large'
        style={{ top: '40%' }}
      />
      {/* nube mediana */}
      <motion.div
        initial={{ left: '-100px' }}
        custom={{ duration: 55, delay: -25 }}
        variants={cloudVariants}
        animate="animate"
        className='cloud-sprite cloud-medium'
        style={{ top: '60%' }}
      />
      {/* nube alargada */}
      <motion.div
        initial={{ left: '-175px' }}
        custom={{ duration: 75, delay: -35 }}
        variants={cloudVariants}
        animate="animate"
        className="cloud-sprite cloud-long"
        style={{ top: '80%' }}
      />
            
      {/* Nube pequeña estándar */}
      <motion.div
        initial={{ left: '-100px' }}
        custom={{ duration: 45, delay: -15 }}
        variants={cloudVariants}
        animate="animate"
        className="cloud-sprite "
        style={{ top: '30%' }}
      />

      {/* Nube pequeña esponjosa */}
      <motion.div
        initial={{ left: '-140px' }}
        custom={{ duration: 60, delay: -20 }}
        variants={cloudVariants}
        animate="animate"
        className="cloud-sprite cloud-fluffy"
        style={{ top: '70%' }}
      />
    </div>
  );
};

export default SpriteCloudSky;