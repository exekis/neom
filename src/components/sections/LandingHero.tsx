'use client';

import { motion } from 'framer-motion';

export default function LandingHero() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900">
      <div className="container py-24 md:py-32 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white"
        >
          Transform Your
          <span className="mx-2 inline-block bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-2xl px-3 py-1">
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Audio with AI
            </span>
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-6 max-w-2xl mx-auto text-white/70"
        >
          Use natural language to apply professional audio effects, fades, and enhancements. No technical
          skills required—just describe what you want your track to sound like.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <a href="#demo" className="btn btn-primary hover-lift">Start Editing Free</a>
          <a href="#features" className="btn btn-ghost hover-lift">Watch Demo</a>
        </motion.div>
      </div>
    </header>
  );
}
