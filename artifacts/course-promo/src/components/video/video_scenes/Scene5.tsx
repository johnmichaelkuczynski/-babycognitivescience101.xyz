import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500), // Graph animates
      setTimeout(() => setPhase(3), 3000), // Stats pop
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-20 bg-slate-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: '10%' }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex w-full max-w-6xl items-center gap-20 relative z-10">
        <div className="flex-1">
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="font-bold text-lg mb-8 text-slate-800">Mastery Trajectory</div>
            
            {/* Chart Area */}
            <div className="relative h-[200px] border-l-2 border-b-2 border-slate-200">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[1,2,3,4].map(i => <div key={i} className="border-t border-slate-100 w-full" />)}
              </div>
              
              {/* Line graph */}
              {phase >= 2 && (
                <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                  <motion.path 
                    d="M 0 150 Q 50 150 100 120 T 200 100 T 300 40 T 400 20"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  {/* Nodes */}
                  {[
                    {cx: 0, cy: 150}, {cx: 100, cy: 120}, {cx: 200, cy: 100}, {cx: 300, cy: 40}, {cx: 400, cy: 20}
                  ].map((pos, i) => (
                    <motion.circle 
                      key={i}
                      cx={pos.cx} cy={pos.cy} r="6" fill="#fff" stroke="#0f172a" strokeWidth="3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + i * 0.3, type: "spring" }}
                    />
                  ))}
                </svg>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              >
                <div className="text-3xl font-black text-slate-900">85%</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Accuracy</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-3xl font-black text-slate-900">12</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Streak</div>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-3xl font-black text-blue-600">Lvl 4</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Difficulty</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 pr-10">
          <motion.h2 
            className="text-slate-500 font-bold tracking-widest uppercase text-sm mb-4"
          >
            Live Analytics
          </motion.h2>
          <motion.h1 
            className="text-5xl font-display font-bold text-slate-900 leading-tight mb-6"
          >
            Adaptive practice that actually adapts.
          </motion.h1>
          <motion.p className="text-xl text-slate-600 leading-relaxed">
            Questions ramp up in difficulty after a streak, and scale down dynamically after a miss. 
            Track per-section mastery in real time.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}