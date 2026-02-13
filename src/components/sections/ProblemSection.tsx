"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Clock, Layers, DollarSign, X } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Weeks of back-and-forth",
    desc: "Traditional factory planning takes 6-10 weeks of manual iteration between teams.",
    old: "6-10 weeks",
    new_: "2 hours",
  },
  {
    icon: Layers,
    title: "No single model",
    desc: "Decisions scattered across spreadsheets, CAD files, and tribal knowledge.",
    old: "12+ tools",
    new_: "1 platform",
  },
  {
    icon: DollarSign,
    title: "Costs drift silently",
    desc: "Design-to-RFQ handoffs start too late, causing budget overruns.",
    old: "30% overrun",
    new_: "Day-1 CAPEX",
  },
];

export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="problem"
      className="relative bg-[#080a0f] py-24 md:py-32 overflow-hidden"
      data-testid="section-problem"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, hsl(160 70% 45% / 0.06) 0%, transparent 60%)",
        }}
      />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="nav-demo-btn px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] cursor-default mb-6 inline-block"
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
          <h2
            className="text-heading mb-4"
            data-testid="text-problem-heading"
          >
            Factory planning is still
            <br />
            <span className="text-slate-400">slow, manual, and dated</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {problems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50, rotateX: 10 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.15, ease: "easeOut" }}
            >
              <div
                className="bg-[#080a0f]/80 border border-primary/30 shadow-[0_0_40px_hsl(160_70%_45%_/_0.2)] backdrop-blur-sm h-full rounded-2xl"
                data-testid={`card-problem-${i}`}
              >
                <div className="p-5 md:p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 200 }}
                    className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                  </motion.div>

                  <h3
                    className="font-serif text-base md:text-lg font-bold mb-3 text-white"
                    data-testid={`text-problem-title-${i}`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-[1.6] mb-6">{item.desc}</p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-500/5 border border-red-500/15">
                      <X className="w-3.5 h-3.5 text-red-400" />
                      <span className="font-serif text-sm text-red-400 line-through">{item.old}</span>
                    </div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
                    >
                      <span className="text-slate-400">→</span>
                    </motion.span>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary/5 border border-primary/15">
                      <span className="font-serif text-sm text-primary font-semibold">{item.new_}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

