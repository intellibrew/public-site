"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FC, PropsWithChildren } from "react";
import FactoryThreeScene from "@/components/FactoryThreeScene";

const SafeAnimatePresence = AnimatePresence as FC<
  PropsWithChildren<{ mode?: "wait" | "sync" | "popLayout" }>
>;

const BUILD_STAGES = [
  {
    id: "foundation",
    step: "01",
    label: "Foundation",
    line: "Lay the grid, walls, and spatial footprint.",
    progress: 0.25,
  },
  {
    id: "conveyors",
    step: "02",
    label: "Conveyors",
    line: "Route material between every zone on the line.",
    progress: 0.5,
  },
  {
    id: "machines",
    step: "03",
    label: "Machines",
    line: "Deploy presses, welders, paint, and assembly cells.",
    progress: 0.85,
  },
  {
    id: "flow",
    step: "04",
    label: "Live flow",
    line: "Simulate product moving end to end — spot bottlenecks instantly.",
    progress: 1,
  },
] as const;

const SCENE_KEYFRAMES = [0, ...BUILD_STAGES.map((stage) => stage.progress)];
const SCROLL_MARKS = BUILD_STAGES.map((_, index) => (index + 1) / BUILD_STAGES.length);
const WHEEL_SENSITIVITY = 0.0011;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function progressFromScroll(scrollProgress: number) {
  const marks = [0, ...SCROLL_MARKS];
  const clamped = clamp(scrollProgress);

  for (let index = 0; index < SCENE_KEYFRAMES.length - 1; index += 1) {
    const startMark = marks[index];
    const endMark = marks[index + 1];
    if (clamped <= endMark || index === SCENE_KEYFRAMES.length - 2) {
      const span = endMark - startMark || 1;
      const local = clamp((clamped - startMark) / span);
      return lerp(SCENE_KEYFRAMES[index], SCENE_KEYFRAMES[index + 1], local);
    }
  }

  return SCENE_KEYFRAMES[SCENE_KEYFRAMES.length - 1];
}

function stageFromScroll(scrollProgress: number) {
  const clamped = clamp(scrollProgress);
  return Math.min(
    BUILD_STAGES.length - 1,
    Math.floor(clamped * BUILD_STAGES.length)
  );
}

export default function FactoryBuildExperience() {
  const shellRef = useRef<HTMLDivElement>(null);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const touchStartRef = useRef<number | null>(null);
  const wheelLockRef = useRef(false);

  const [sceneProgressValue, setSceneProgressValue] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [scrollProgressDisplay, setScrollProgressDisplay] = useState(0);

  const applyScrollProgress = useCallback((value: number, direction?: 1 | -1) => {
    const current = targetScrollRef.current;

    if (direction === 1 && current >= 1) return;
    if (direction === -1 && current <= 0) return;

    const clamped = clamp(value);
    if (clamped === current) return;

    targetScrollRef.current = clamped;
    setActiveStage(stageFromScroll(clamped));
    setScrollProgressDisplay(clamped);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const lenis = window.lenis;
    lenis?.stop();

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      lenis?.start();
    };
  }, []);

  useEffect(() => {
    let rafId = 0;

    const tick = () => {
      const target = clamp(targetScrollRef.current);
      let current = currentScrollRef.current;

      if (target >= 1) {
        current = 1;
      } else if (target <= 0) {
        current = 0;
      } else {
        const next = lerp(current, target, 0.14);
        current = Math.abs(next - target) < 0.0004 ? target : clamp(next);
      }

      currentScrollRef.current = current;
      setSceneProgressValue(progressFromScroll(current));

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const isInsideShell = (event: Event) =>
      event.target instanceof Node && shell.contains(event.target);

    const isZoomGesture = (event: WheelEvent) => event.ctrlKey || event.metaKey;

    const handleWheel = (event: WheelEvent) => {
      if (!isInsideShell(event)) return;
      if (isZoomGesture(event)) return;

      const direction: 1 | -1 = event.deltaY > 0 ? 1 : -1;
      if (Math.abs(event.deltaY) < 1) return;

      if (direction === 1 && targetScrollRef.current >= 1) return;
      if (direction === -1 && targetScrollRef.current <= 0) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const delta = event.deltaY * WHEEL_SENSITIVITY;
      applyScrollProgress(targetScrollRef.current + delta, direction);
    };

    const nudgeScroll = (direction: 1 | -1) => {
      if (wheelLockRef.current) return;
      wheelLockRef.current = true;
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 48);

      applyScrollProgress(targetScrollRef.current + direction * 0.045, direction);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        nudgeScroll(1);
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        nudgeScroll(-1);
      }
      if (event.key === "Home") {
        event.preventDefault();
        applyScrollProgress(0, -1);
      }
      if (event.key === "End") {
        event.preventDefault();
        applyScrollProgress(1, 1);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!isInsideShell(event)) return;
      touchStartRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isInsideShell(event) || touchStartRef.current === null) return;

      const currentY = event.touches[0]?.clientY ?? touchStartRef.current;
      const delta = touchStartRef.current - currentY;
      if (Math.abs(delta) < 4) return;

      const direction: 1 | -1 = delta > 0 ? 1 : -1;
      if (direction === 1 && targetScrollRef.current >= 1) return;
      if (direction === -1 && targetScrollRef.current <= 0) return;

      event.preventDefault();
      applyScrollProgress(targetScrollRef.current + delta * 0.0022, direction);
      touchStartRef.current = currentY;
    };

    const onTouchEnd = () => {
      touchStartRef.current = null;
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKeyDown);
    shell.addEventListener("touchstart", onTouchStart, { passive: true });
    shell.addEventListener("touchmove", onTouchMove, { passive: false });
    shell.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
      shell.removeEventListener("touchstart", onTouchStart);
      shell.removeEventListener("touchmove", onTouchMove);
      shell.removeEventListener("touchend", onTouchEnd);
    };
  }, [applyScrollProgress]);

  return (
    <div
      ref={shellRef}
      data-lenis-prevent
      className="relative h-[100svh] w-full overflow-hidden bg-[#050708]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 68% 55% at 72% 52%, rgba(20,184,166,0.12), transparent 68%), radial-gradient(ellipse 46% 40% at 18% 36%, rgba(14,116,144,0.09), transparent 62%)",
        }}
      />

      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden md:flex-row">
        <aside
          className="relative order-2 flex min-h-0 flex-1 flex-col justify-center border-t border-teal-500/10 bg-[rgba(2,8,12,0.88)] px-6 backdrop-blur-md md:order-1 md:h-full md:w-[30%] md:flex-none md:border-r md:border-t-0 md:px-10 lg:px-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-teal-400/35 to-transparent md:block"
          />

          <div className="mb-5 flex shrink-0 items-center gap-2 md:mb-8">
            {BUILD_STAGES.map((stage, index) => (
              <motion.span
                key={stage.id}
                className="h-1 flex-1 rounded-full origin-center"
                animate={{
                  backgroundColor:
                    index <= activeStage
                      ? "rgba(45,212,191,0.85)"
                      : "rgba(148,163,184,0.18)",
                  scaleY: index === activeStage ? 1.8 : 1,
                }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>

          <div className="min-h-0 flex-1 content-center md:flex-none">
            <SafeAnimatePresence mode="wait">
              <motion.div
                key={BUILD_STAGES[activeStage].id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3 md:space-y-5"
              >
                <p className="font-fragment text-[10px] uppercase tracking-[0.28em] text-teal-300/70 md:text-[11px]">
                  Step {BUILD_STAGES[activeStage].step}
                </p>
                <h2 className="font-orbitron text-[1.35rem] leading-[1.15] tracking-wide text-white md:text-[2rem]">
                  {BUILD_STAGES[activeStage].label}
                </h2>
                <p className="max-w-[28ch] text-[14px] leading-relaxed text-slate-300/90 md:max-w-[22ch] md:text-base">
                  {BUILD_STAGES[activeStage].line}
                </p>
              </motion.div>
            </SafeAnimatePresence>
          </div>

          <div className="mt-4 shrink-0 space-y-3 md:mt-8">
            <div className="h-1 overflow-hidden rounded-full bg-slate-800/80">
              <motion.div
                className="h-full rounded-full bg-teal-400/80"
                animate={{ width: `${scrollProgressDisplay * 100}%` }}
                transition={{ duration: 0.15, ease: "linear" }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 md:text-[11px]">
            </p>
          </div>
        </aside>

        <div className="relative order-1 h-[min(44svh,360px)] w-full shrink-0 md:order-2 md:h-full md:min-h-0 md:w-[70%] md:flex-1">
          <div className="factory-stage pointer-events-auto absolute inset-0 overflow-hidden">
            <FactoryThreeScene progress={sceneProgressValue} />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[rgba(2,8,12,0.95)] to-transparent md:hidden"
          />
        </div>
      </div>
    </div>
  );
}
