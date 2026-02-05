"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock3, GitBranch, FileText } from "lucide-react";
import { AnimateInView } from "@/components/AnimateInView";
import AdvancedFactoryAnimation from "@/components/AdvancedFactoryAnimation";

export function ProblemSection() {
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
      className="relative bg-[rgba(8,10,15,0.88)] py-24 overflow-hidden"
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 50%)",
        }}
      />

      <motion.div 
        className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-6 md:flex-row md:items-center md:px-10"
        style={{ opacity }}
      >
        <div className="flex-1 space-y-6">
          <AnimateInView>
            <motion.span 
              className="nav-demo-btn px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] cursor-default"
              style={{
                ["--shiny-cta-bg" as string]: "#1b0b10",
                ["--shiny-cta-bg-subtle" as string]: "#3f151c",
                ["--shiny-cta-fg" as string]: "#fecaca",
                ["--shiny-cta-highlight" as string]: "#fb7185",
                ["--shiny-cta-highlight-subtle" as string]: "rgba(252,165,165,0.9)",
                pointerEvents: "none",
              }}
            >
              Problem
            </motion.span>
          </AnimateInView>
          <AnimateInView delay={60}>
            <h2 className="text-heading">
              Factory planning is
              <br />
              still slow, manual,
              <br />
              and dated.
            </h2>
          </AnimateInView>
          <AnimateInView delay={120}>
            <ul className="mt-4 space-y-3 text-body">
              {[
                {
                  label: "Weeks of back-and-forth.",
                  icon: <Clock3 className="h-3.5 w-3.5" />,
                },
                {
                  label: "Decisions scattered without a single model.",
                  icon: <GitBranch className="h-3.5 w-3.5" />,
                },
                {
                  label: "Design-to-RFQs start too late, costs drift.",
                  icon: <FileText className="h-3.5 w-3.5" />,
                },
              ].map(({ label, icon }, index) => (
                <motion.li 
                  key={label} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <motion.span 
                    className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-2xl border border-[#fb7185]/60 bg-[radial-gradient(circle_at_30%_0%,rgba(252,165,165,0.38),rgba(127,29,29,0.95))] text-[#fecaca] shadow-[0_10px_30px_-18px_rgba(248,113,113,0.95)]"
                  >
                    <span className="text-[#fda4af]">
                      {icon}
                    </span>
                  </motion.span>
                  <span>{label}</span>
                </motion.li>
              ))}
            </ul>
          </AnimateInView>
        </div>

        <motion.div 
          className="flex-1 flex items-center justify-center"
          style={{ y }}
        >
          <AdvancedFactoryAnimation />
        </motion.div>
      </motion.div>
    </section>
  );
}

