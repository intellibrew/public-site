"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Rocket, TrendingUp, FileSearch, MapPin } from "lucide-react";
import { useCountUp } from "@/hooks/use-scroll-animation";

const cases = [
  {
    icon: Rocket,
    title: "New line launch",
    subtitle: "In hours, not weeks",
    desc: "Turn CAD + BOM into a complete line model with stations, cycle times, layout & costs.",
    metricValue: 2,
    metricSuffix: " hrs",
    metricLabel: "vs 6-10 weeks traditionally",
    progressPercent: 92,
    color: "emerald",
  },
  {
    icon: TrendingUp,
    title: "Capacity expansion",
    subtitle: "Find bottlenecks before you build",
    desc: "Simulate throughput and utilization to find constraints and cheapest fixes.",
    metricValue: 30,
    metricSuffix: "%",
    metricLabel: "output increase with targeted changes",
    progressPercent: 85,
    color: "primary",
  },
  {
    icon: FileSearch,
    title: "RFQs & sourcing",
    subtitle: "Spec-ready packs",
    desc: "Auto-generate equipment specs and RFQ packs from your line model.",
    metricValue: 3,
    metricSuffix: " days",
    metricLabel: "vs 2-3 weeks traditionally",
    progressPercent: 88,
    color: "violet",
  },
  {
    icon: MapPin,
    title: "Layout optimization",
    subtitle: "Reduce travel, lift OEE",
    desc: "Iterate floor layouts to minimize travel distance and handling steps.",
    metricValue: 40,
    metricSuffix: "%",
    metricLabel: "less material travel distance",
    progressPercent: 78,
    color: "amber",
  },
];

type UseCaseItem = (typeof cases)[0];

const colorMap: Record<
  UseCaseItem["color"],
  { accent: string; bg: string; border: string; bar: string }
> = {
  emerald: {
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    bar: "bg-emerald-500",
  },
  primary: {
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    bar: "bg-primary",
  },
  blue: {
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    bar: "bg-blue-500",
  },
  violet: {
    accent: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    bar: "bg-violet-500",
  },
  amber: {
    accent: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    bar: "bg-amber-500",
  },
};

function UseCaseCard({ item, index }: { item: UseCaseItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { count, ref: counterRef } = useCountUp(item.metricValue, 1500);

  const colors = colorMap[item.color];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="bg-[#080a0f]/80 border border-primary/30 shadow-[0_0_40px_hsl(160_70%_45%_/_0.2)] backdrop-blur-sm h-full rounded-2xl">
        <div className="p-5 md:p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
            className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center mb-4`}
          >
            <item.icon className={`w-4 h-4 ${colors.accent}`} />
          </motion.div>

          <h3 className="font-serif text-base md:text-lg font-bold tracking-tight leading-snug mb-1.5" data-testid={`text-use-case-title-${index}`}>
            {item.title}
          </h3>
          <p className={`font-serif text-[10px] font-medium uppercase tracking-wider ${colors.accent} mb-3`}>
            {item.subtitle}
          </p>
          <p className="text-slate-400 text-xs leading-[1.6] mb-5">{item.desc}</p>

          <div ref={counterRef}>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span
                className={`font-serif text-lg md:text-xl font-bold ${colors.accent} tabular-nums tracking-tight`}
                data-testid={`text-use-case-metric-${index}`}
              >
                {count}
                {item.metricSuffix}
              </span>
            </div>
            <p className="font-serif text-[10px] text-slate-400 leading-relaxed mb-3">{item.metricLabel}</p>

            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${item.progressPercent}%` } : {}}
                transition={{ duration: 1.5, delay: 0.5 + index * 0.15, ease: "easeOut" }}
                className={`h-full rounded-full ${colors.bar}`}
              />
            </div>
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
      className="relative bg-[#080a0f] py-24 md:py-32 overflow-hidden"
      data-testid="section-use-cases"
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
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12"
        >
          <span className="shiny-badge">Use Cases</span>
          <h2
            className="text-heading mt-4 mb-2"
            data-testid="text-use-cases-heading"
          >
            Where NeoFab pays back immediately.
          </h2>
          <p className="text-body">
            Four places teams see impact in the first weeks.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {cases.map((item, i) => (
            <UseCaseCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

