import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),  // Reveal first Wug
      setTimeout(() => setPhase(2), 2000), // "Now there are two..."
      setTimeout(() => setPhase(3), 3500), // Reveal second Wug
      setTimeout(() => setPhase(4), 5000), // Reveal answer WUGS
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e293b]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: '-20%', filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="absolute top-16 left-16 text-[2vw] font-bold text-accent tracking-widest uppercase"
        initial={{ opacity: 0, x: -20 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      >
        Unit 1.5: Language
      </motion.div>

      <div className="flex flex-col items-center w-full px-20">
        <div className="flex gap-16 justify-center items-end h-[30vh] mb-12">
          {/* First Wug */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/wug.png`} 
              alt="Wug" 
              className="w-[20vw] h-[20vw] object-contain drop-shadow-2xl brightness-0 invert" 
            />
            <div className="text-[3vw] font-display font-bold mt-4">This is a WUG.</div>
          </motion.div>

          {/* Second Wug */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0, y: 50 }}
            animate={phase >= 3 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/wug.png`} 
              alt="Wug" 
              className="w-[20vw] h-[20vw] object-contain drop-shadow-2xl brightness-0 invert" 
            />
          </motion.div>
        </div>

        <motion.div 
          className="text-[5vw] font-display font-bold text-center leading-tight flex items-baseline gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          Now there are two
          <motion.div className="relative inline-block border-b-4 border-white pb-2 min-w-[20vw] text-center">
            {phase >= 4 && (
              <motion.span 
                className="text-secondary absolute bottom-2 left-0 right-0"
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                WUGS
              </motion.span>
            )}
            <span className="opacity-0">WUGS</span>
          </motion.div>
          ?
        </motion.div>
      </div>
    </motion.div>
  );
}
