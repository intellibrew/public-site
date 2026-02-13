"use client";

import { motion } from "framer-motion";

const smoothSpring = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  mass: 0.8,
};

export function CTASection({ onBookDemo }: { onBookDemo?: () => void } = {}) {
  return (
    <section id="contact" className="relative z-10 py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.h2
          className="text-heading mb-4"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...smoothSpring, delay: 0.1 }}
        >
          Plan your factory in hours.
        </motion.h2>

        <motion.p
          className="text-body mb-8 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...smoothSpring, delay: 0.2 }}
        >
          Get a sample output pack and see what NeoFab generates from your inputs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...smoothSpring, delay: 0.3 }}
        >
          {onBookDemo ? (
            <button
              type="button"
              onClick={onBookDemo}
              className="nav-demo-btn"
              aria-label="Book a demo"
            >
              <span>Book a demo</span>
            </button>
          ) : (
            <span className="nav-demo-btn cursor-default inline-flex" aria-hidden>
              <span>Book a demo</span>
            </span>
          )}
        </motion.div>
      </div>
    </section>
  );
}
