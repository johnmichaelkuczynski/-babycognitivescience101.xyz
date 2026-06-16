import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-bg-muted)_0%,_transparent_60%)] opacity-[0.5]" />

      <motion.div 
        className="relative z-10 flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-[6vw] font-display font-black tracking-tight leading-none text-center mb-6">
          COGNITIVE<br/>SCIENCE 101
        </div>

        <motion.div 
          className="text-[2vw] text-white/80 font-bold max-w-[70vw] text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          A baby course on how the mind works — 1 unit, 8 sections.
          <br/>
          <span className="text-secondary mt-2 inline-block">Taught, tutored, drilled, and graded by AI.</span>
        </motion.div>
      </motion.div>

      {/* Decorative floating shapes */}
      <motion.div 
        className="absolute top-[20%] left-[20%] w-16 h-16 border-4 border-accent rounded-full"
        animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[20%] right-[20%] w-24 h-24 border-4 border-secondary rotate-45"
        animate={{ scale: [1, 1.5, 1], rotate: [45, 135, 45] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
