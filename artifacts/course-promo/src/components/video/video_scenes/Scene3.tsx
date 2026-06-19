import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000), // Select answer
      setTimeout(() => setPhase(3), 3500), // Lock & Submit
      setTimeout(() => setPhase(4), 4500), // Reveal grading
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center p-20 bg-slate-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: '-10%', filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-1/2 pr-20 relative z-10 flex flex-col justify-center">
        <motion.h2 
          className="text-slate-500 font-bold tracking-widest uppercase text-sm mb-4"
        >
          Rigorous Assessment
        </motion.h2>
        <motion.h1 
          className="text-5xl font-display font-bold text-slate-900 leading-tight mb-6"
        >
          One attempt. Fully locked. Inverted partial credit.
        </motion.h1>
        <motion.p className="text-xl text-slate-600 leading-relaxed mb-6">
          Submit once. Hedging earns nothing. The strongest, most falsifiable conclusion earns top marks, supported by instant AI rationales.
        </motion.p>
      </div>

      <div className="w-1/2 relative z-10">
        <motion.div 
          className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-700">Homework 1.6</span>
            <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              {phase >= 3 ? 'Locked' : 'Draft'}
            </span>
          </div>
          <div className="p-8">
            <div className="text-lg font-medium text-slate-800 mb-6">
              Which statement represents the strongest falsifiable hypothesis regarding confirmation bias in this scenario?
            </div>

            <div className="space-y-3 mb-8">
              {[
                "People might sometimes ignore contrary evidence.",
                "Individuals presented with counter-evidence will double-down on their prior belief.",
                "It depends on the individual's prior exposure to the topic."
              ].map((opt, i) => (
                <motion.div 
                  key={i}
                  className={`p-4 rounded-lg border ${phase >= 2 && i === 1 ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {opt}
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between items-end">
              <motion.button 
                className={`px-6 py-3 rounded-lg font-bold transition-all ${phase >= 3 ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-lg'}`}
              >
                {phase >= 3 ? 'Submitted' : 'Submit Final Answer'}
              </motion.button>
              
              {phase >= 4 && (
                <motion.div 
                  className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200 max-w-sm"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                >
                  <div className="font-bold flex items-center gap-2 mb-1">
                    <span className="text-xl">100%</span> 
                    <span className="text-xs uppercase tracking-wider bg-green-200 px-2 py-0.5 rounded-sm">Full Credit</span>
                  </div>
                  <div className="text-sm leading-snug">
                    Rationale: Strongest falsifiable claim. The other options hedge ("might sometimes", "depends") which cannot be rigorously tested.
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}