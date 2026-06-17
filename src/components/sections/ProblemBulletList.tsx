"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Clock3, GitBranch, FileText, type LucideIcon } from "lucide-react";
import { TextRevealAuto } from "@/components/motion/TextRevealAuto";

export const PROBLEM_BULLETS = [
  { label: "Weeks of back-and-forth.", icon: Clock3 },
  { label: "Decisions scattered without a single model.", icon: GitBranch },
  { label: "Design-to-RFQs start too late, costs drift.", icon: FileText },
] as const;

const BULLET_TEXT_CLASS = "min-w-0 flex-1 font-body text-sm leading-snug sm:text-base sm:leading-relaxed";
const ITEM_DELAY = 0.12;
const TEXT_STAGGER = 0.022;
const TEXT_DURATION = 0.2;
const FALLBACK_MUTED = "#475569";
const FALLBACK_PRIMARY = "#94a3b8";
const ENTRANCE_EASE = [0.25, 0.46, 0.45, 0.94] as const;

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

type BulletRowProps = {
  label: string;
  icon: LucideIcon;
  index: number;
  reveal?: ProblemBulletListProps["reveal"];
  embedded: boolean;
  spineActive: boolean;
};

function BulletIcon({ icon: Icon, active, delay, static: isStatic }: { icon: LucideIcon; active: boolean; delay: number; static?: boolean }) {
  const icon = (
    <span className="relative z-[1] mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-teal-500/35 bg-[#080a0f]">
      <Icon className="h-3 w-3 text-teal-300/90" strokeWidth={1.75} />
    </span>
  );

  if (isStatic) return icon;

  return (
    <motion.span
      className="relative z-[1] mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-teal-500/35 bg-[#080a0f]"
      initial={{ opacity: 0, scale: 0.65 }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.65 }}
      transition={{ duration: 0.35, delay, ease: ENTRANCE_EASE }}
    >
      <Icon className="h-3 w-3 text-teal-300/90" strokeWidth={1.75} />
    </motion.span>
  );
}

function BulletRow({ label, icon, index, reveal, embedded, spineActive }: BulletRowProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const rowInView = useInView(rowRef, { once: true, amount: 0.55 });
  const useScrollReveal = !!reveal;
  const useInViewReveal = !reveal && !embedded;
  const active = useScrollReveal ? reveal.active : useInViewReveal ? rowInView : false;
  const textDelay = index * ITEM_DELAY;
  const iconDelay = useScrollReveal || useInViewReveal ? textDelay : 0;
  const isStatic = embedded && !reveal;

  return (
    <li ref={rowRef} className="relative flex items-start gap-3 py-2 first:pt-0 last:pb-0">
      <div className="relative flex w-5 shrink-0 flex-col items-center self-stretch">
        {index === 0 ? (
          isStatic ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-2 bottom-2 flex justify-center"
            >
              <div className="h-full w-px bg-gradient-to-b from-teal-500/35 via-teal-500/12 to-transparent" />
            </div>
          ) : (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-2 bottom-2 flex justify-center"
              initial={false}
            >
              <motion.div
                className="w-px bg-gradient-to-b from-teal-500/35 via-teal-500/12 to-transparent"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: spineActive ? 1 : 0 }}
                transition={{ duration: 0.55, ease: ENTRANCE_EASE }}
                style={{ height: "100%", transformOrigin: "top" }}
              />
            </motion.div>
          )
        ) : null}
        <BulletIcon icon={icon} active={isStatic ? true : active} delay={iconDelay} static={isStatic} />
      </div>

      {isStatic ? (
        <span className={BULLET_TEXT_CLASS}>{label}</span>
      ) : (
        <TextRevealAuto
          key={useScrollReveal ? `problem-bullet-${index}-${reveal.cycle}` : `problem-bullet-${index}`}
          text={label}
          className={BULLET_TEXT_CLASS}
          mutedColor={reveal?.mutedColor ?? FALLBACK_MUTED}
          primaryColor={reveal?.primaryColor ?? FALLBACK_PRIMARY}
          active={active}
          delay={textDelay}
          stagger={TEXT_STAGGER}
          duration={TEXT_DURATION}
        />
      )}
    </li>
  );
}

export function ProblemBulletList({ className = "", reveal, embedded = false }: ProblemBulletListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const listInView = useInView(listRef, { once: true, amount: 0.35 });
  const spineActive = reveal ? reveal.active : embedded ? false : listInView;

  return (
    <ul ref={listRef} className={`relative w-full text-body ${className}`}>
      {PROBLEM_BULLETS.map(({ label, icon }, index) => (
        <BulletRow
          key={label}
          label={label}
          icon={icon}
          index={index}
          reveal={reveal}
          embedded={embedded}
          spineActive={spineActive}
        />
      ))}
    </ul>
  );
}
