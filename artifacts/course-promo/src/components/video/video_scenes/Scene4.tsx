import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),  // Premise
      setTimeout(() => setPhase(2), 2000), // Question
      setTimeout(() => setPhase(3), 3500), // Gut answer (10c)
      setTimeout(() => setPhase(4), 4500), // Cross out 10c
      setTimeout(() => setPhase(5), 5500), // Reveal 5c
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]"
      initial={{ opacity: 0, y: '20%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="absolute top-16 left-16 text-[2vw] font-bold text-accent tracking-widest uppercase"
        initial={{ opacity: 0, x: -20 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      >
        Unit 1.6: Reasoning
      </motion.div>

      <div className="w-[70vw] bg-[#1e293b] rounded-3xl p-12 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="relative z-10">
          <motion.div 
            className="text-[3vw] leading-relaxed font-body text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          >
            A bat and a ball cost <span className="text-white font-bold">$1.10</span> in total.
          </motion.div>
          <motion.div 
            className="text-[3vw] leading-relaxed font-body text-white/90 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            The bat costs <span className="text-white font-bold">$1.00</span> more than the ball.
          </motion.div>

          <motion.div 
            className="text-[4vw] font-display font-bold mt-12 text-accent"
            initial={{ opacity: 0, x: -50 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            How much does the ball cost?
          </motion.div>

          <div className="mt-12 flex items-center h-[12vh]">
            <motion.div 
              className="text-[6vw] font-black font-body text-white relative inline-block"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={phase >= 3 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.5, rotate: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              10¢
              {/* Strikethrough */}
              {phase >= 4 && (
                <motion.div 
                  className="absolute top-1/2 left-[-10%] right-[-10%] h-[1vh] bg-accent origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
            </motion.div>

            {phase >= 5 && (
              <motion.div 
                className="text-[8vw] font-black font-body text-secondary ml-12"
                initial={{ opacity: 0, x: 50, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                5¢
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
