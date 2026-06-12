"use client";

import { motion, useMotionValue } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

const CYCLE_WIDTH = 3200;

const clients: { name: string; logo: string; noInvert?: boolean }[] = [
  { name: "1lERoJywrOVVSh87b9PsC8C9YM8", logo: "/logo/1lERoJywrOVVSh87b9PsC8C9YM8.avif", noInvert: true },
  { name: "Amazon", logo: "/logo/Amazon-logo.png", noInvert: true },
  { name: "Atlas Surgical", logo: "/logo/AtlasSurgical-logo.png", noInvert: true },
  { name: "BCG", logo: "/logo/BCG-logo.png", noInvert: true },
  { name: "Beta", logo: "/logo/Beta-Logo.png", noInvert: true },
  // { name: "Can-Tek", logo: "/logo/Cantek-logo.png", noInvert: true },
  // { name: "Cummins", logo: "/logo/Cummins-logo.png", noInvert: true },
  { name: "Deloitte", logo: "/logo/Deloitte-logo.png", noInvert: true },
  { name: "Ford", logo: "/logo/Ford-logo.png", noInvert: true },
  // { name: "Indore", logo: "/logo/Indore-logo.png", noInvert: true },
  { name: "Macow", logo: "/logo/macow-logo.png", noInvert: true },
  { name: "NKE Bearings", logo: "/logo/NKE-logo.png", noInvert: true },
  { name: "Ola", logo: "/logo/ola.svg" },
  { name: "One Energy", logo: "/logo/one-energy.svg" },
  { name: "Seurat", logo: "/logo/Seurat-logo.png", noInvert: true },
  // { name: "Shivam Steel & Bearings", logo: "/logo/Shivam-logo.png", noInvert: true },
  { name: "Shyam Steel", logo: "/logo/Shyamsteel-logo.png", noInvert: true },
  { name: "Society Tea", logo: "/logo/Society-logo.png", noInvert: true },
  { name: "Volkswagen", logo: "/logo/Volkswagen-logo.png", noInvert: true },
  { name: "Yellow", logo: "/logo/Yellow-logo.png", noInvert: true },
];

export function ClientsSection() {
  const x = useMotionValue(0);
  const isDragging = useRef(false);
  const baseOffset = useRef(0);
  const lastClientX = useRef(0);

  const runAnimation = useCallback(() => {
    let raf: number;
    let lastTime = performance.now();
    const speed = CYCLE_WIDTH / 50;
    const loop = (now: number) => {
      if (!isDragging.current) {
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
    const up = () => { isDragging.current = false; };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointerleave", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointerleave", up);
    };
  }, []);

  return (
    <section id="clients" className="relative bg-[#060608] py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 55%)" }} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 mb-6 md:mb-10">
        <motion.p 
          className="text-center text-slate-400 text-sm sm:text-[16px] italic"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trusted by Engineers and Manufacturers globally
        </motion.p>
      </div>

      <div
        className="relative z-10 w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-r from-[#060608] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-l from-[#060608] to-transparent pointer-events-none" />

        <motion.div
          className="flex gap-6 sm:gap-10 md:gap-12 items-center"
          style={{ x }}
        >
          {clients.map((client, index) => (
            <motion.div
              key={`first-${index}`}
              className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl border border-teal-500/20 bg-black/30 min-w-[100px] sm:min-w-[140px] md:min-w-[160px] h-[60px] sm:h-[70px] md:h-[80px] flex items-center justify-center"
            >
              <img
                src={client.logo}
                alt={client.name}
                width={120}
                height={50}
                className={`object-contain max-h-[36px] sm:max-h-[44px] md:max-h-[50px] max-w-[100px] sm:max-w-[130px] w-auto h-auto opacity-80 ${!client.noInvert ? "brightness-0 invert" : ""}`}
              />
            </motion.div>
          ))}
          {clients.map((client, index) => (
            <motion.div
              key={`second-${index}`}
              className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl border border-teal-500/20 bg-black/30 min-w-[100px] sm:min-w-[140px] md:min-w-[160px] h-[60px] sm:h-[70px] md:h-[80px] flex items-center justify-center"
            >
              <img
                src={client.logo}
                alt={client.name}
                width={120}
                height={50}
                className={`object-contain max-h-[36px] sm:max-h-[44px] md:max-h-[50px] max-w-[100px] sm:max-w-[130px] w-auto h-auto opacity-80 ${!client.noInvert ? "brightness-0 invert" : ""}`}
              />
            </motion.div>
          ))}
          {clients.map((client, index) => (
            <motion.div
              key={`third-${index}`}
              className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl border border-teal-500/20 bg-black/30 min-w-[100px] sm:min-w-[140px] md:min-w-[160px] h-[60px] sm:h-[70px] md:h-[80px] flex items-center justify-center"
            >
              <img
                src={client.logo}
                alt={client.name}
                width={120}
                height={50}
                className={`object-contain max-h-[36px] sm:max-h-[44px] md:max-h-[50px] max-w-[100px] sm:max-w-[130px] w-auto h-auto opacity-80 ${!client.noInvert ? "brightness-0 invert" : ""}`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
