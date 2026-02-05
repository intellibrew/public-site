"use client";

import { motion } from "framer-motion";
const useCases = [
  {
    title: "New line launch",
    subtitle: "in days, not months",
    description: "Turn CAD + BOM into a complete line model with stations, cycle times, layout & costs.",
    badge: "Planning: 6-10 weeks → 6-48 hours",
  },
  {
    title: "Capacity expansion",
    subtitle: "find bottlenecks before you build",
    description: "Simulate throughput and utilization to find constraints and cheapest fixes.",
    badge: "+10-30% output with targeted changes",
  },
  {
    title: "RFQs & sourcing",
    subtitle: "go to vendors with spec-ready packs",
    description: "Auto-generate equipment specs and RFQ packs from your line model.",
    badge: "RFQ prep: 2-3 weeks → 1-3 days",
  },
  {
    title: "Layout optimization",
    subtitle: "reduce travel, lift OEE",
    description: "Iterate floor layouts to minimize travel distance and handling steps.",
    badge: "15-40% less material travel",
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="relative bg-[#080a0f] py-24 overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-5xl px-6">
        <motion.h2 
          className="text-heading mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Use cases
        </motion.h2>

        <motion.p 
          className="text-body mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Where NeoFab pays back immediately.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="relative rounded-2xl border border-blue-500/20 p-6 transition-all duration-300 hover:border-blue-500/40 flex flex-col"
              style={{
                background: "linear-gradient(180deg, rgba(12,16,28,0.7) 0%, rgba(8,12,22,0.8) 100%)",
                boxShadow: "0 0 25px rgba(59,130,246,0.05)",
              }}
            >
              <h3 className="text-subheading mb-3">
                {useCase.title}
                <span className="text-slate-400 font-normal"> - {useCase.subtitle}</span>
              </h3>

              <p className="text-slate-400 text-[13px] leading-relaxed mb-5">
                {useCase.description}
              </p>

              <div className="mt-auto self-center inline-flex items-center px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/5">
                <span className="text-blue-300 text-[12px] font-medium">
                  {useCase.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
