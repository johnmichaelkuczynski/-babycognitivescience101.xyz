import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(226,232,240,0.1)_0%,_transparent_70%)]" />

      <motion.div 
        className="relative z-10 flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={phase >= 1 ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-[6vw] font-display font-black tracking-tight leading-none text-center mb-6">
          Cognitive<br/>Science 101
        </div>

        <motion.div 
          className="px-6 py-2 border border-slate-700 rounded-full text-slate-300 font-medium tracking-widest uppercase text-sm mt-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          AI-Powered Course
        </motion.div>
      </motion.div>
    </motion.div>
  );
}