"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import FactoryBuildExperience from "@/components/FactoryBuildExperience";
import { clamp, smoothstep } from "@/lib/factory/math";

export const FACTORY_SCROLL_HEIGHT = "220svh";
const HERO_FADE_START = 0;
const HERO_FADE_END = 0.42;

function scrollProgress(container: HTMLElement) {
  const scrollable = container.offsetHeight - window.innerHeight;
  const y = window.scrollY ?? document.documentElement.scrollTop;
  return scrollable > 0 ? clamp(y / scrollable, 0, 1) : 0;
}

export default function FactoryLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const buildProgressRef = useRef(0);
  const storyEnabledRef = useRef(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [factoryVisible, setFactoryVisible] = useState(false);
  const [factoryInteractive, setFactoryInteractive] = useState(false);
  const [storyEnabled, setStoryEnabled] = useState(false);
  const getBuildProgress = useCallback(() => buildProgressRef.current, []);
  const getStoryEnabled = useCallback(() => storyEnabledRef.current, []);

  useEffect(() => {
    const resetScroll = () => {
      buildProgressRef.current = 0;
      storyEnabledRef.current = false;
      setStoryEnabled(false);
      setHeroOpacity(1);
      setFactoryVisible(false);
      window.scrollTo(0, 0);
    };

    resetScroll();
    const t = window.setTimeout(resetScroll, 0);

    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frameId = 0;
    let scheduled = false;
    let heroOpacityValue = 1;

    const syncFromScroll = () => {
      scheduled = false;
      const scroll = scrollProgress(container);
      const heroOpacityNext = 1 - smoothstep(HERO_FADE_START, HERO_FADE_END, scroll);
      const heroActive = heroOpacityNext > 0.02;
      const buildProgress = heroActive ? 0 : 1;
      buildProgressRef.current = buildProgress;

      if (Math.abs(heroOpacityValue - heroOpacityNext) > 0.001) {
        heroOpacityValue = heroOpacityNext;
        setHeroOpacity(heroOpacityNext);
      }

      const showFactory = !heroActive;
      if (!storyEnabledRef.current && showFactory) {
        storyEnabledRef.current = true;
      }
      const storyActive = storyEnabledRef.current && showFactory;
      setStoryEnabled((prev) => (prev === storyActive ? prev : storyActive));
      setFactoryVisible((prev) => (prev === showFactory ? prev : showFactory));

      setFactoryInteractive((prev) => (prev === showFactory ? prev : showFactory));
    };

    const scheduleSync = () => {
      if (scheduled) return;
      scheduled = true;
      frameId = window.requestAnimationFrame(syncFromScroll);
    };

    syncFromScroll();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
    };
  }, []);

  return (
    <main className="relative bg-[#050708] text-white">
      <Header overlay transparent minimal />

      <div
        className={`fixed inset-0 z-10 transition-opacity duration-200 ease-out ${
          factoryInteractive ? "" : "pointer-events-none"
        }`}
        style={{
          opacity: factoryVisible ? 1 : 0,
          visibility: factoryVisible ? "visible" : "hidden",
        }}
      >
        <FactoryBuildExperience
          getBuildProgress={getBuildProgress}
          getStoryEnabled={getStoryEnabled}
          storyEnabled={storyEnabled}
        />
      </div>

      <div
        className="pointer-events-none fixed inset-0 z-20 bg-[#050708] transition-opacity duration-200 ease-out"
        style={{
          opacity: heroOpacity,
          visibility: heroOpacity < 0.02 ? "hidden" : "visible",
        }}
      >
        <div
          className="relative flex h-full flex-col justify-center px-6 pt-[70px] transition-transform duration-300 ease-out md:px-10 lg:px-16"
          style={{
            transform: `translateY(${(1 - heroOpacity) * -12}px) scale(${
              0.985 + heroOpacity * 0.015
            })`,
          }}
        >
          <div className="mx-auto w-full max-w-4xl">
            <p className="mb-4 font-fragment text-[10px] uppercase tracking-[0.32em] text-teal-300/70 md:text-[11px]">
              NeoFab · AI factory planning
            </p>
            <h1 className="font-orbitron text-[clamp(2rem,6vw,3.75rem)] leading-[1.02] tracking-tight">
              <span className="block text-white">Plan your factory</span>
              <span className="mt-1 block text-teal-300">in hours, not weeks</span>
            </h1>
          </div>

          <p className="absolute inset-x-0 bottom-10 text-center font-fragment text-[9px] uppercase tracking-[0.28em] text-teal-400/55">
            Scroll to enter
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative z-0"
        style={{ height: FACTORY_SCROLL_HEIGHT }}
        aria-hidden
      />
    </main>
  );
}
