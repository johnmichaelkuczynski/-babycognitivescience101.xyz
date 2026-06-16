import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  const words = ["bed", "rest", "awake", "tired", "dream", "night", "snooze"];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),  // Start flashing words
      setTimeout(() => setPhase(2), 2500), // Stop flashing, ask question
      setTimeout(() => setPhase(3), 4500), // Reveal "SLEEP"
      setTimeout(() => setPhase(4), 5500), // "Never shown"
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e293b]"
      initial={{ opacity: 0, x: '20%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="absolute top-16 left-16 text-[2vw] font-bold text-accent tracking-widest uppercase"
        initial={{ opacity: 0, x: -20 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      >
        Unit 1.4: Memory
      </motion.div>

      <div className="relative w-full h-full flex flex-col items-center justify-center">
        
        {/* Flashing Words */}
        {phase === 1 && (
          <div className="absolute inset-0 flex items-center justify-center">
            {words.map((word, i) => (
              <motion.div
                key={i}
                className="absolute text-[8vw] font-black uppercase tracking-widest text-white/80"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 1.2] }}
                transition={{ duration: 0.3, delay: i * 0.25, times: [0, 0.5, 1] }}
              >
                {word}
              </motion.div>
            ))}
          </div>
        )}

        {/* Question & Reveal */}
        {phase >= 2 && (
          <motion.div 
            className="flex flex-col items-center z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-[4vw] font-display font-bold text-white mb-8">
              Did you see the word
            </div>
            <motion.div 
              className="text-[10vw] font-black uppercase tracking-tighter leading-none"
              initial={{ scale: 0.8, color: '#fdfbf7' }}
              animate={phase >= 3 ? { scale: 1.1, color: '#f43f5e' } : { scale: 1, color: '#fdfbf7' }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              SLEEP?
            </motion.div>

            {phase >= 4 && (
              <motion.div
                className="mt-8 text-[3vw] font-bold text-white/60 bg-black/40 px-8 py-4 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                It was <span className="text-white">never</span> shown.
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
