import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000), // Slide ruler in
      setTimeout(() => setPhase(3), 3500), // Reveal equal lines
      setTimeout(() => setPhase(4), 5000), // "Perception"
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-bg-light"
      initial={{ opacity: 0, x: '20%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="absolute top-16 left-16 text-[2vw] font-bold text-accent tracking-widest uppercase"
        initial={{ opacity: 0, x: -20 }}
        animate={phase >= 4 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      >
        Unit 1.3: Perception
      </motion.div>

      <div className="relative w-[60vw] h-[40vh] flex flex-col justify-center items-center gap-16">
        {/* Top Line */}
        <motion.div className="relative w-[30vw] h-[4px] bg-white flex items-center justify-center">
          {/* Arrows pointing in */}
          <motion.div className="absolute left-0 w-8 h-8 border-t-4 border-l-4 border-white rotate-[-45deg] origin-left translate-x-[-2px]" />
          <motion.div className="absolute left-0 w-8 h-8 border-b-4 border-l-4 border-white rotate-[45deg] origin-left translate-x-[-2px]" />
          
          <motion.div className="absolute right-0 w-8 h-8 border-t-4 border-r-4 border-white rotate-[45deg] origin-right translate-x-[2px]" />
          <motion.div className="absolute right-0 w-8 h-8 border-b-4 border-r-4 border-white rotate-[-45deg] origin-right translate-x-[2px]" />
        </motion.div>

        {/* Bottom Line */}
        <motion.div className="relative w-[30vw] h-[4px] bg-white flex items-center justify-center">
          {/* Arrows pointing out */}
          <motion.div className="absolute left-0 w-8 h-8 border-t-4 border-r-4 border-white rotate-[45deg] origin-left translate-x-[-12px]" />
          <motion.div className="absolute left-0 w-8 h-8 border-b-4 border-r-4 border-white rotate-[-45deg] origin-left translate-x-[-12px]" />
          
          <motion.div className="absolute right-0 w-8 h-8 border-t-4 border-l-4 border-white rotate-[-45deg] origin-right translate-x-[12px]" />
          <motion.div className="absolute right-0 w-8 h-8 border-b-4 border-l-4 border-white rotate-[45deg] origin-right translate-x-[12px]" />
        </motion.div>

        {/* Ruler Overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
        >
          <motion.div 
            className="absolute top-[-5vh] bottom-[-5vh] left-[15vw] border-l-2 border-dashed border-secondary"
            initial={{ opacity: 0, y: '-100%' }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: '-100%' }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
          />
          <motion.div 
            className="absolute top-[-5vh] bottom-[-5vh] right-[15vw] border-r-2 border-dashed border-secondary"
            initial={{ opacity: 0, y: '100%' }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: '100%' }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
          />
        </motion.div>
      </div>

      <motion.div 
        className="mt-16 text-[4vw] font-display font-bold text-center leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      >
        Your brain builds the world.<br/>
        <span className="text-secondary italic">They are identical.</span>
      </motion.div>
    </motion.div>
  );
}
