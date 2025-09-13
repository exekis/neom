'use client';

import { motion } from 'framer-motion';

const ITEMS = [
  {
    icon: '💬',
    title: 'Chat with AI',
    body: "Talk to our AI like a human engineer: 'Fade out the last 20s' or 'Add reverb'—it understands.",
  },
  {
    icon: '🎛️',
    title: 'Visual Timeline',
    body: 'See edits in real time. Select regions and compare original vs. modified side by side.',
  },
  { icon: '🎧', title: 'Instant Playback', body: 'Play back changes immediately. A/B compare to hear the difference.' },
  { icon: '🔧', title: 'Pro Tools', body: 'Normalize, adjust gain, fades, and add loops—all via simple commands.' },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-surface">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-4xl font-bold text-white mb-14"
        >
          What Makes NOEM Special?
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card p-6 h-full"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
