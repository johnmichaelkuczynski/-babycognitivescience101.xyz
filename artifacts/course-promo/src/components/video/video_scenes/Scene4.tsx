import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2000), // Scan line
      setTimeout(() => setPhase(3), 3500), // Show results
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-20 bg-slate-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <motion.div className="text-center mb-16 relative z-10">
        <motion.h2 className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-4">
          Academic Integrity
        </motion.h2>
        <motion.h1 className="text-5xl font-display font-bold leading-tight">
          Two-Layer Authorship Detection
        </motion.h1>
      </motion.div>

      <div className="flex gap-8 w-full max-w-5xl relative z-10">
        {/* Essay Input */}
        <motion.div 
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm text-slate-400 mb-4 font-mono border-b border-slate-700 pb-2">submission.txt</div>
          <div className="font-serif text-slate-300 leading-relaxed text-sm">
            Consciousness remains the hard problem of cognitive science. While functional imaging shows us neural correlates, it fails to bridge the explanatory gap regarding subjective qualitative experience...
          </div>
          
          {phase >= 2 && (
            <motion.div 
              className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]"
              initial={{ x: '-10px' }}
              animate={{ x: '500px' }}
              transition={{ duration: 2, ease: "linear" }}
            />
          )}
        </motion.div>

        {/* Results Panel */}
        <div className="w-80 flex flex-col gap-4">
          {/* Static Classifier */}
          <motion.div 
            className="bg-slate-800 border border-slate-700 rounded-xl p-5"
            initial={{ opacity: 0, x: 30 }}
            animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Static Analysis</div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center font-bold text-green-400">
                98%
              </div>
              <div className="text-sm font-medium">Human-Written</div>
            </div>
            <div className="text-xs text-slate-500 leading-tight">
              Perplexity and burstiness metrics align with natural human variance.
            </div>
          </motion.div>

          {/* Keystroke Analysis */}
          <motion.div 
            className="bg-slate-800 border border-slate-700 rounded-xl p-5"
            initial={{ opacity: 0, x: 30 }}
            animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ type: "spring", damping: 20, delay: 0.15 }}
          >
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Behavioral Analysis</div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1, delay: 3.5 }}
                />
              </div>
              <div className="text-sm font-bold text-blue-400">Match</div>
            </div>
            <div className="text-xs text-slate-500 leading-tight">
              Typing cadence, pause intervals, and revision patterns confirmed. No bulk paste detected.
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}