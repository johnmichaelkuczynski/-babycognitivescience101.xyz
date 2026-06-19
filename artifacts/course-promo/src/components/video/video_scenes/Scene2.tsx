import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000), // Toggle depth
      setTimeout(() => setPhase(3), 4000), // AI Tutor types
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center p-20"
      initial={{ opacity: 0, x: '10%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-1/3 pr-16 relative z-10 flex flex-col justify-center">
        <motion.h2 
          className="text-slate-500 font-bold tracking-widest uppercase text-sm mb-4"
        >
          Adaptive Content
        </motion.h2>
        <motion.h1 
          className="text-5xl font-display font-bold text-slate-900 leading-tight mb-6"
        >
          Read at your own depth. Ask questions anywhere.
        </motion.h1>
        <motion.p className="text-xl text-slate-600 leading-relaxed">
          AI-rewritten content on demand, plus a contextual tutor that streams answers line by line.
        </motion.p>
      </div>

      <div className="w-2/3 flex gap-6 h-[80vh] relative z-10">
        {/* Reader */}
        <motion.div 
          className="flex-1 bg-white rounded-xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="border-b border-slate-100 p-4 flex justify-between items-center bg-slate-50">
            <div className="font-bold font-display">1.2 The Big Idea</div>
            <div className="flex bg-slate-200 rounded-lg p-1">
              <div className="px-3 py-1 text-sm font-medium rounded-md text-slate-500">Short</div>
              <motion.div 
                className="px-3 py-1 text-sm font-medium rounded-md bg-white shadow-sm text-slate-900"
                layout
              >
                Medium
              </motion.div>
              <div className="px-3 py-1 text-sm font-medium rounded-md text-slate-500">Long</div>
            </div>
          </div>
          <div className="p-8 relative">
            <motion.div 
              className="space-y-4"
              animate={{ opacity: phase >= 2 ? 0.3 : 1 }}
            >
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-11/12"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-4/5"></div>
            </motion.div>
            {phase >= 2 && (
              <motion.div 
                className="absolute inset-0 p-8 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="font-serif text-lg leading-relaxed text-slate-800">
                  The central premise of cognitive science is that the mind can be understood as an information processing system. Much like a computer, the brain takes in sensory input, applies rules and representations, and produces behavior.
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* AI Tutor Sidebar */}
        <motion.div 
          className="w-[300px] bg-slate-900 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
          initial={{ opacity: 0, x: 40 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <div className="p-4 border-b border-slate-800 font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            AI Tutor
          </div>
          <div className="p-4 flex flex-col gap-4 flex-1">
            <div className="bg-slate-800 rounded-lg p-3 text-sm self-end max-w-[85%]">
              What does "representations" mean here?
            </div>
            {phase >= 3 && (
              <div className="bg-slate-800/50 rounded-lg p-3 text-sm self-start max-w-[90%] border border-slate-700 leading-relaxed">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05 }}
                >
                  {`In cognitive science, a representation is an internal mental symbol that stands for something in the external world.`.split(" ").map((word, i) => (
                    <motion.span 
                      key={i} 
                      className="inline-block mr-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}