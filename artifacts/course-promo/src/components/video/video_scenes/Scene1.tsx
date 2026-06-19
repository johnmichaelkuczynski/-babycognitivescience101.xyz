import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const sections = [
    "1.1 What Cognitive Science Is",
    "1.2 The Big Idea: Mind as Information Processing",
    "1.3 Perception",
    "1.4 Memory",
    "1.5 Language and Thought",
    "1.6 Reasoning and Bias",
    "1.7 Brains and Machines",
    "1.8 Consciousness"
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center p-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-1/2 pr-20 relative z-10 flex flex-col justify-center">
        <motion.h2 
          className="text-slate-500 font-bold tracking-widest uppercase text-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          Curriculum
        </motion.h2>
        <motion.h1 
          className="text-6xl font-display font-bold text-slate-900 leading-tight mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        >
          A rigorous on-ramp to how the mind works.
        </motion.h1>
        <motion.p 
          className="text-2xl text-slate-600 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          One foundational unit. Eight comprehensive sections. 
        </motion.p>
      </div>

      <div className="w-1/2 relative z-10">
        <motion.div 
          className="bg-white rounded-xl shadow-2xl shadow-slate-200 border border-slate-100 p-8"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
        >
          <div className="text-xl font-display font-bold mb-6 pb-4 border-b border-slate-100">
            Unit 1: Foundations
          </div>
          <div className="flex flex-col gap-3">
            {sections.map((section, idx) => (
              <motion.div 
                key={idx}
                className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100"
                initial={{ opacity: 0, x: 20 }}
                animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="font-medium text-slate-700">{section}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}