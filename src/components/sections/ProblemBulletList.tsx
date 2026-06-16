"use client";

import { motion } from "framer-motion";
import { Clock3, GitBranch, FileText, type LucideIcon } from "lucide-react";
import { TextRevealAuto } from "@/components/motion/TextRevealAuto";

export const PROBLEM_BULLETS = [
  { label: "Weeks of back-and-forth.", icon: Clock3 },
  { label: "Decisions scattered without a single model.", icon: GitBranch },
  { label: "Design-to-RFQs start too late, costs drift.", icon: FileText },
] as const;

type ProblemBulletListProps = {
  className?: string;
  reveal?: {
    active: boolean;
    cycle: number;
    mutedColor: string;
    primaryColor: string;
  };
  embedded?: boolean;
};

function BulletIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="relative z-[1] mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-teal-500/25 bg-[#080a0f] md:h-5 md:w-5 md:border-teal-500/35">
      <Icon className="h-3 w-3 text-teal-400/80 md:text-teal-300/90" strokeWidth={1.75} />
    </span>
  );
}

export function ProblemBulletList({ className = "", reveal, embedded = false }: ProblemBulletListProps) {
  return (
    <ul className={`relative w-full text-body ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-[8px] top-2 w-px bg-gradient-to-b from-teal-500/35 via-teal-500/12 to-transparent md:left-[9px]"
      />

      {PROBLEM_BULLETS.map(({ label, icon }, index) => (
        <li key={label} className="relative flex items-start gap-2.5 py-2 first:pt-0 last:pb-0 md:gap-3 md:py-2.5">
          <BulletIcon icon={icon} />
          {reveal ? (
            <TextRevealAuto
              key={`problem-bullet-${index}-${reveal.cycle}`}
              text={label}
              className="min-w-0 flex-1 font-body text-sm leading-snug md:text-base md:leading-relaxed"
              mutedColor={reveal.mutedColor}
              primaryColor={reveal.primaryColor}
              active={reveal.active}
              delay={index * 0.12}
              stagger={0.022}
              duration={0.2}
            />
          ) : (
            <motion.span
              className="min-w-0 flex-1 text-sm leading-snug md:text-base md:leading-relaxed"
              initial={embedded ? false : { opacity: 0, x: -12 }}
              whileInView={embedded ? undefined : { opacity: 1, x: 0 }}
              viewport={embedded ? undefined : { once: true }}
              transition={embedded ? undefined : { duration: 0.45, delay: 0.15 + index * 0.08 }}
            >
              {label}
            </motion.span>
          )}
        </li>
      ))}
    </ul>
  );
}
