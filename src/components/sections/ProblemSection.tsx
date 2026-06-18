"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimateInView } from "@/components/AnimateInView";
import AdvancedFactoryAnimation from "@/components/AdvancedFactoryAnimation";
import { ProblemBulletList } from "@/components/sections/ProblemBulletList";

type ProblemSectionProps = {
  embedded?: boolean;
};

export function ProblemSection({ embedded = false }: ProblemSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]);

  return (
    <section
      ref={sectionRef}
      id="problem"
      className={
        embedded
          ? "factory-scroll-panel factory-scroll-panel--problem relative h-full overflow-hidden"
          : "relative bg-[rgba(8,10,15,0.88)] py-24 overflow-hidden"
      }
    >
      {!embedded && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 55%)",
          }}
        />
      )}

      <motion.div
        className={`relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:items-center md:px-10 ${
          embedded ? "h-full max-h-full justify-center py-[calc(var(--site-header-total)+1rem)]" : ""
        }`}
        style={embedded ? undefined : { opacity }}
      >
        <div className="flex-1 space-y-6">
          <AnimateInView>
            <motion.span 
              className="shiny-badge px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] cursor-default"
              style={{ pointerEvents: "none" }}
            >
              Problem
            </motion.span>
          </AnimateInView>
          <AnimateInView delay={60}>
            <h2 className="text-heading font-fragment">
              <span>Factory planning is</span>
              <br />
              <span className="text-primary">still slow, manual,</span>
              <br />
              <span className="text-primary">and dated.</span>
            </h2>
          </AnimateInView>
          <AnimateInView delay={120}>
            <ProblemBulletList className="mt-4" embedded={embedded} />
          </AnimateInView>
        </div>

        <motion.div
          className={`flex-1 flex items-center justify-center ${embedded ? "max-h-[42vh] md:max-h-none" : ""}`}
          style={embedded ? undefined : { y }}
        >
          <AdvancedFactoryAnimation />
        </motion.div>
      </motion.div>
    </section>
  );
}

