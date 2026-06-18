"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { ClipTypeStagger } from "@/components/motion/ClipTypeStagger";
import { JOURNEY } from "@/lib/factory/scrollJourney";

const HERO_TITLE = "Plan your factory\nin hours, not weeks";

type FactoryHeroTitleProps = {
  scrollProgress: MotionValue<number>;
  scrollReady: boolean;
};

export function FactoryHeroTitle({ scrollProgress, scrollReady }: FactoryHeroTitleProps) {
  const [heroTextActive, setHeroTextActive] = useState(false);
  const [heroCycle, setHeroCycle] = useState(0);
  const prevHeroActive = useRef(false);

  useEffect(() => {
    if (!scrollReady) return;
    setHeroTextActive(scrollProgress.get() < JOURNEY.hero.fadeOut[1]);
  }, [scrollReady, scrollProgress]);

  useMotionValueEvent(scrollProgress, "change", (p) => {
    if (p < JOURNEY.hero.fadeOut[1]) {
      setHeroTextActive(true);
    }
  });

  useEffect(() => {
    if (!heroTextActive) return;
    if (!prevHeroActive.current) {
      setHeroCycle((c) => c + 1);
    }
    prevHeroActive.current = true;
  }, [heroTextActive]);

  return (
    <ClipTypeStagger
      key={`hero-title-${heroCycle}`}
      as="h1"
      text={HERO_TITLE}
      className="factory-hero-title font-orbitron leading-[1.02] tracking-tight"
      lineClassNames={["block w-full text-white", "factory-hero-title-accent mt-1 block w-full text-teal-300"]}
      splitBy="line"
      preset="slideUp"
      align="center"
      active={heroTextActive}
      stagger={0.1}
      delay={0.12}
      replayKey={heroCycle}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    />
  );
}
