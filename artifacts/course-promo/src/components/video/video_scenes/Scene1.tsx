import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-bg-dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1 }}
    >
      <div className="relative z-10 text-center flex flex-col items-center justify-center h-full w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-accent tracking-[0.2em] text-[1.5vw] uppercase mb-8 font-bold"
        >
          A Baby Course On
        </motion.div>

        <motion.h1 
          className="text-[8vw] leading-none font-display text-white text-center tracking-tight font-black"
        >
          {'HOW THE'.split(' ').map((word, i) => (
            <motion.span 
              key={`w1-${i}`}
              className="inline-block mr-[2vw]"
              initial={{ opacity: 0, y: 40, rotateX: -20 }}
              animate={phase >= 1 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: -20 }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          ))}
          <br/>
          {'MIND WORKS'.split(' ').map((word, i) => (
            <motion.span 
              key={`w2-${i}`}
              className="inline-block mr-[2vw]"
              initial={{ opacity: 0, y: 40, rotateX: -20 }}
              animate={phase >= 1 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: -20 }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 bg-white text-black px-8 py-4 text-[1.8vw] font-bold tracking-widest rounded-sm"
        >
          COGNITIVE SCIENCE 101
        </motion.div>
      </div>
    </motion.div>
  );
}
