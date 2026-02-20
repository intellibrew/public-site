"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { Rocket, TrendingUp, FileSearch, MapPin } from "lucide-react";

const cases = [
  {
    icon: Rocket,
    title: "New line launch",
    desc: "CAD + BOM → complete line model with stations, layout & costs.",
    metricValue: 48,
    metricSuffix: " hrs",
    metricContext: "vs 6–10 weeks",
  },
  {
    icon: TrendingUp,
    title: "Capacity expansion",
    desc: "Simulate throughput to find constraints and bottlenecks.",
    metricValue: 30,
    metricSuffix: "%",
    metricContext: "output uplift",
  },
  {
    icon: FileSearch,
    title: "RFQs & sourcing",
    desc: "Spec-ready packs from your line model.",
    metricValue: 3,
    metricSuffix: " days",
    metricContext: "vs 2–3 weeks",
  },
  {
    icon: MapPin,
    title: "Layout optimization",
    desc: "Minimize travel distance and handling steps.",
    metricValue: 40,
    metricSuffix: "%",
    metricContext: "less material travel",
  },
];

function UseCaseCard({ item, index }: { item: (typeof cases)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { count, ref: counterRef } = useCountUp(item.metricValue, 1500);

  const colors = {
    accent: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    hoverBorder: "hover:border-teal-500/50",
    hoverShadow: "hover:shadow-[0_0_40px_rgba(20,184,166,0.2)]",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div
        className={`relative rounded-2xl border bg-card/60 backdrop-blur-sm h-full overflow-hidden transition-all duration-300 cursor-pointer ${colors.border} ${colors.hoverBorder} ${colors.hoverShadow} border`}
        data-testid={`card-use-case-${index}`}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{
                delay: 0.2 + index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
              className={`shrink-0 w-12 h-12 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center`}
            >
              <item.icon className={`w-5 h-5 ${colors.accent}`} />
            </motion.div>
            <h3
              className="text-lg md:text-xl font-semibold font-orbitron text-foreground"
              data-testid={`text-use-case-title-${index}`}
            >
              {item.title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {item.desc}
          </p>

          <div ref={counterRef} className="flex items-baseline gap-2 flex-wrap">
            <span
              className={`text-lg md:text-xl font-bold font-orbitron ${colors.accent} tabular-nums`}
              data-testid={`text-use-case-metric-${index}`}
            >
              {count}
              {item.metricSuffix}
            </span>
            <span className="text-xs text-muted-foreground font-body">
              {item.metricContext}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function UseCasesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      id="use-cases"
      className="relative py-24 md:py-36 bg-[#080a0f]"
      data-testid="section-use-cases"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 55%)",
        }}
      />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="shiny-badge">Use Cases</span>
          </motion.div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-orbitron mb-4"
            data-testid="text-use-cases-heading"
          >
            Where NeoFab
            <br />
            <span className="text-primary">pays back immediately</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {cases.map((item, i) => (
            <UseCaseCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
