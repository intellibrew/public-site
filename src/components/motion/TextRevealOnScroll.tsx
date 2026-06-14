"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";

type SpringTransition = {
  duration?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
};

type TextRevealOnScrollProps = {
  text: string;
  className?: string;
  mutedColor?: string;
  primaryColor?: string;
  balance?: boolean;
  replay?: boolean;
  mode?: "character" | "word" | "sentence";
  /** External scroll progress (0–1). When provided, internal scroll tracking is skipped. */
  progress?: MotionValue<number>;
  /** Remap external progress into 0–1 reveal range */
  progressRange?: [number, number];
  transition?: SpringTransition;
};

function toSpringOptions(transition?: SpringTransition) {
  const hasSpringValues =
    typeof transition?.stiffness === "number" ||
    typeof transition?.damping === "number" ||
    typeof transition?.mass === "number";

  if (!hasSpringValues && typeof transition?.duration === "number") {
    const duration = Math.max(transition.duration, 0.05);
    return {
      stiffness: 170 / (duration * duration),
      damping: 26 / duration,
      mass: 1,
      restDelta: 0.001,
    };
  }

  return {
    stiffness: typeof transition?.stiffness === "number" ? transition.stiffness : 100,
    damping: typeof transition?.damping === "number" ? transition.damping : 30,
    mass: typeof transition?.mass === "number" ? transition.mass : 1,
    restDelta: 0.001,
  };
}

function RevealItem({
  children,
  progress,
  range,
  mutedColor,
  primaryColor,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  mutedColor: string;
  primaryColor: string;
}) {
  const color = useTransform(progress, range, [mutedColor, primaryColor]);
  return <motion.span style={{ color }}>{children}</motion.span>;
}

export function TextRevealOnScroll({
  text,
  className = "",
  mutedColor = "#64748b",
  primaryColor = "#94a3b8",
  balance = true,
  replay = true,
  mode = "word",
  progress: externalProgress,
  progressRange,
  transition = { duration: 0.4 },
}: TextRevealOnScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end center"],
  });

  const maxProgress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > maxProgress.get()) {
      maxProgress.set(latest);
    }
  });

  const sourceProgress = externalProgress ?? (replay ? scrollYProgress : maxProgress);
  const rangeStart = progressRange?.[0] ?? 0;
  const rangeEnd = progressRange?.[1] ?? 1;
  const remappedProgress = useTransform(
    sourceProgress,
    [rangeStart, rangeEnd],
    [0, 1],
    { clamp: true }
  );
  const progressToUse = useSpring(remappedProgress, toSpringOptions(transition));

  const renderText = () => {
    if (!text) return null;

    let items: string[] = [];
    if (mode === "character") {
      items = text.split("");
    } else if (mode === "word") {
      items = text.match(/([\S]+|\s+)/g) ?? [];
    } else {
      items = text.match(/[^.!?\n]+(?:[.!?]+)?|\n|\s+/g) ?? [];
    }

    let totalValids = 0;
    items.forEach((item) => {
      if (item.trim().length > 0) totalValids++;
    });

    let currentIdx = 0;

    return items.map((itemStr, idx) => {
      if (itemStr.trim().length === 0 && itemStr !== "\n") {
        return <React.Fragment key={`${mode}-space-${idx}`}>{itemStr}</React.Fragment>;
      }
      if (itemStr === "\n") {
        return <br key={`${mode}-br-${idx}`} />;
      }

      const start = currentIdx / Math.max(totalValids, 1);
      const end = (currentIdx + 1) / Math.max(totalValids, 1);
      currentIdx++;

      return (
        <RevealItem
          key={`${mode}-${idx}`}
          progress={progressToUse}
          range={[start, end]}
          mutedColor={mutedColor}
          primaryColor={primaryColor}
        >
          {itemStr}
        </RevealItem>
      );
    });
  };

  return (
    <motion.div
      ref={containerRef}
      className={className}
      role="region"
      tabIndex={0}
      aria-label={text}
      style={{
        textWrap: balance ? "balance" : "wrap",
        whiteSpace: "pre-wrap",
        display: "block",
        color: mutedColor,
      }}
    >
      <span aria-hidden="true">{renderText()}</span>
    </motion.div>
  );
}
