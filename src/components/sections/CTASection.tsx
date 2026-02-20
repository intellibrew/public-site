"use client";

import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
const smoothSpring = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  mass: 0.8,
};

const getRandomDuration = (base: number, variance: number) => 
  base + (Math.random() - 0.5) * variance;

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.4, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [30, 0]);

  const animDurations = useMemo(() => ({
    glow: getRandomDuration(5, 1),
    shimmer: getRandomDuration(4, 0.8),
    corner1: getRandomDuration(2.5, 0.5),
    corner2: getRandomDuration(2.8, 0.5),
    corner3: getRandomDuration(2.3, 0.5),
    corner4: getRandomDuration(2.6, 0.5),
  }), []);

  return (
    <section ref={sectionRef} id="contact" className="relative z-10 py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 55%)" }} />
      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <motion.div
          className="relative rounded-2xl border border-teal-500/30 p-10 md:p-14 text-center overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(12,12,14,0.98) 0%, rgba(6,6,8,0.99) 100%)",
            boxShadow: "0 0 40px rgba(20,184,166,0.1), inset 0 1px 0 rgba(20,184,166,0.1)",
            scale,
            opacity,
            y,
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={smoothSpring}
          whileHover={{
            boxShadow: "0 0 80px rgba(20,184,166,0.18), inset 0 1px 0 rgba(20,184,166,0.15)",
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(100deg, transparent 20%, rgba(20,184,166,0.04) 40%, rgba(94,234,212,0.06) 50%, rgba(20,184,166,0.04) 60%, transparent 80%)",
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: animDurations.shimmer,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.25, 1],
              repeatDelay: 1,
            }}
          />

          <motion.div 
            className="absolute top-0 left-0 w-6 h-6 border-t border-l border-teal-500/40"
            animate={{ 
              opacity: [0.3, 0.9, 0.5, 1, 0.3],
              scale: [1, 1.02, 1, 1.03, 1],
            }}
            transition={{ duration: animDurations.corner1, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-0 right-0 w-6 h-6 border-t border-r border-teal-500/40"
            animate={{ 
              opacity: [0.4, 1, 0.4, 0.8, 0.4],
              scale: [1, 1.03, 1, 1.02, 1],
            }}
            transition={{ duration: animDurations.corner2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-teal-500/40"
            animate={{ 
              opacity: [0.35, 0.85, 0.4, 1, 0.35],
              scale: [1, 1.02, 1, 1.04, 1],
            }}
            transition={{ duration: animDurations.corner3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-teal-500/40"
            animate={{ 
              opacity: [0.45, 0.95, 0.5, 0.85, 0.45],
              scale: [1, 1.04, 1, 1.02, 1],
            }}
            transition={{ duration: animDurations.corner4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          />

          <motion.h2 
            className="text-heading mb-4 relative z-10 font-orbitron"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothSpring, delay: 0.1 }}
          >
            Plan your factory <span className="text-primary">in hours.</span>
          </motion.h2>
          
          <motion.p 
            className="text-body mb-0 max-w-xl mx-auto relative z-10"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothSpring, delay: 0.2 }}
          >
            Get a sample output pack and see what NeoFab generates from your inputs.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
