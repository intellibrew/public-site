"use client";

import { motion, useMotionValue } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

const CYCLE_WIDTH = 3200;

export const CLIENT_LOGOS: { name: string; logo: string; noInvert?: boolean }[] = [
  { name: "1lERoJywrOVVSh87b9PsC8C9YM8", logo: "/logo/1lERoJywrOVVSh87b9PsC8C9YM8.avif", noInvert: true },
  { name: "Amazon", logo: "/logo/Amazon-logo.png", noInvert: true },
  { name: "Atlas Surgical", logo: "/logo/AtlasSurgical-logo.png", noInvert: true },
  { name: "BCG", logo: "/logo/BCG-logo.png", noInvert: true },
  { name: "Beta", logo: "/logo/Beta-Logo.png", noInvert: true },
  // { name: "Cummins", logo: "/logo/Cummins-logo.png", noInvert: true },
  { name: "Deloitte", logo: "/logo/Deloitte-logo.png", noInvert: true },
  { name: "Ford", logo: "/logo/Ford-logo.png", noInvert: true },
  { name: "Macow", logo: "/logo/macow-logo.png", noInvert: true },
  { name: "NKE Bearings", logo: "/logo/NKE-logo.png", noInvert: true },
  { name: "Ola", logo: "/logo/ola.svg" },
  { name: "One Energy", logo: "/logo/one-energy.svg" },
  { name: "Seurat", logo: "/logo/Seurat-logo.png", noInvert: true },
  { name: "Shyam Steel", logo: "/logo/Shyamsteel-logo.png", noInvert: true },
  { name: "Society Tea", logo: "/logo/Society-logo.png", noInvert: true },
  { name: "Volkswagen", logo: "/logo/Volkswagen-logo.png", noInvert: true },
  { name: "Yellow", logo: "/logo/Yellow-logo.png", noInvert: true },
];

type ClientsLogoMarqueeProps = {
  compact?: boolean;
  visibilityRootRef?: React.RefObject<HTMLElement | null>;
};

export function ClientsLogoMarquee({ compact = false, visibilityRootRef }: ClientsLogoMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const isDragging = useRef(false);
  const isVisible = useRef(true);
  const isPageVisible = useRef(true);
  const baseOffset = useRef(0);
  const lastClientX = useRef(0);

  const runAnimation = useCallback(() => {
    let raf: number;
    let lastTime = performance.now();
    const speed = CYCLE_WIDTH / 50;
    const loop = (now: number) => {
      if (isVisible.current && isPageVisible.current && !isDragging.current) {
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        let next = baseOffset.current - speed * dt;
        while (next < -CYCLE_WIDTH) next += CYCLE_WIDTH;
        baseOffset.current = next;
        x.set(next);
      } else {
        lastTime = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [x]);

  useEffect(() => runAnimation(), [runAnimation]);

  useEffect(() => {
    const target = visibilityRootRef?.current ?? rootRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { rootMargin: "160px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibilityRootRef]);

  useEffect(() => {
    const onVisibilityChange = () => {
      isPageVisible.current = document.visibilityState === "visible";
    };
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    lastClientX.current = e.clientX;
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - lastClientX.current;
      lastClientX.current = e.clientX;
      let next = baseOffset.current - delta;
      while (next > 0) next -= CYCLE_WIDTH;
      while (next < -CYCLE_WIDTH) next += CYCLE_WIDTH;
      baseOffset.current = next;
      x.set(next);
    },
    [x]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const up = () => {
      isDragging.current = false;
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointerleave", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointerleave", up);
    };
  }, []);

  const tileClass = compact
    ? "min-w-[88px] sm:min-w-[120px] h-[52px] sm:h-[60px] px-3 py-2 sm:px-4 sm:py-3"
    : "min-w-[100px] sm:min-w-[140px] md:min-w-[160px] h-[60px] sm:h-[70px] md:h-[80px] px-4 py-3 sm:px-6 sm:py-4";

  const imgClass = compact
    ? "max-h-[28px] sm:max-h-[36px] max-w-[80px] sm:max-w-[110px]"
    : "max-h-[36px] sm:max-h-[44px] md:max-h-[50px] max-w-[100px] sm:max-w-[130px]";

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden cursor-grab select-none active:cursor-grabbing ${compact ? "" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-[#060608] to-transparent sm:w-24" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-[#060608] to-transparent sm:w-24" />

      <motion.div className="flex items-center gap-4 sm:gap-8 md:gap-10" style={{ x }}>
        {[0, 1, 2].map((copy) =>
          CLIENT_LOGOS.map((client, index) => (
            <div
              key={`${copy}-${client.name}-${index}`}
              className={`flex flex-shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-black/30 sm:rounded-xl ${tileClass}`}
            >
              <img
                src={client.logo}
                alt={client.name}
                width={120}
                height={50}
                className={`h-auto w-auto object-contain opacity-80 ${imgClass} ${!client.noInvert ? "brightness-0 invert" : ""}`}
              />
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
