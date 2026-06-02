"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import FactoryBuildExperience from "@/components/FactoryBuildExperience";
import { clamp, smoothstep } from "@/lib/factory/math";

export const FACTORY_SCROLL_HEIGHT = "540svh";
const HERO_FADE_START = 0;
const HERO_FADE_END = 0.14;
const BUILD_SCROLL_START = 0.12;
const BUILD_SCROLL_END = 0.96;
export const BUILD_COMPLETE_PROGRESS = 0.999;

function readScrollY() {
  return window.scrollY ?? document.documentElement.scrollTop;
}

function scrollProgress(container: HTMLElement) {
  const scrollable = container.offsetHeight - window.innerHeight;
  return scrollable > 0 ? clamp(readScrollY() / scrollable, 0, 1) : 0;
}

function scrollToBuildProgress(scroll: number) {
  const linear = clamp(
    (scroll - BUILD_SCROLL_START) / (BUILD_SCROLL_END - BUILD_SCROLL_START),
    0,
    1
  );
  return smoothstep(0, 1, linear);
}

function isConstructionComplete(scroll: number, buildProgress: number) {
  return scroll >= BUILD_SCROLL_END - 0.004 && buildProgress >= BUILD_COMPLETE_PROGRESS;
}

export default function FactoryLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const buildProgressRef = useRef(0);
  const storyEnabledRef = useRef(false);
  const returningToHeroRef = useRef(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [factoryVisible, setFactoryVisible] = useState(false);
  const [factoryInteractive, setFactoryInteractive] = useState(false);
  const [storyEnabled, setStoryEnabled] = useState(false);
  const getBuildProgress = useCallback(() => buildProgressRef.current, []);
  const getStoryEnabled = useCallback(
    () => storyEnabledRef.current && buildProgressRef.current >= BUILD_COMPLETE_PROGRESS,
    []
  );

  useEffect(() => {
    const resetScroll = () => {
      buildProgressRef.current = 0;
      storyEnabledRef.current = false;
      returningToHeroRef.current = false;
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
      const heroActive = scroll < HERO_FADE_END;
      const rawBuildProgress = scrollToBuildProgress(scroll);
      const buildProgress = heroActive ? 0 : rawBuildProgress;
      buildProgressRef.current = buildProgress;

      const heroHidden = 1 - smoothstep(HERO_FADE_START, HERO_FADE_END, scroll);
      if (Math.abs(heroOpacityValue - heroHidden) > 0.001) {
        heroOpacityValue = heroHidden;
        setHeroOpacity(heroHidden);
      }

      const constructionComplete = isConstructionComplete(scroll, buildProgress);
      if (!storyEnabledRef.current && constructionComplete) {
        storyEnabledRef.current = true;
      }
      const storyActive = storyEnabledRef.current && constructionComplete;
      setStoryEnabled((prev) => (prev === storyActive ? prev : storyActive));

      const showFactory =
        !heroActive && (buildProgress > 0.002 || storyEnabledRef.current);
      setFactoryVisible((prev) => (prev === showFactory ? prev : showFactory));

      const interactive = showFactory && scroll > HERO_FADE_END;
      setFactoryInteractive((prev) => (prev === interactive ? prev : interactive));
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

  useEffect(() => {
    let touchStartY = 0;

    const returnToHero = () => {
      if (returningToHeroRef.current) return;
      returningToHeroRef.current = true;
      buildProgressRef.current = 0;
      setStoryEnabled(false);
      setHeroOpacity(1);
      setFactoryVisible(false);
      setFactoryInteractive(false);
      window.scrollTo({ top: 0, behavior: "auto" });
      window.setTimeout(() => {
        returningToHeroRef.current = false;
      }, 260);
    };

    const detailOverlayOpen = () => Boolean(document.querySelector(".holo-overlay"));
    const shouldReturnToHero = () =>
      storyEnabledRef.current && readScrollY() > 8 && !detailOverlayOpen();

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY >= 0 || !shouldReturnToHero()) return;
      event.preventDefault();
      returnToHero();
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? touchStartY;
      const swipingDownToScrollUp = currentY - touchStartY > 8;
      if (!swipingDownToScrollUp || !shouldReturnToHero()) return;
      event.preventDefault();
      returnToHero();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!["ArrowUp", "PageUp", "Home"].includes(event.key)) return;
      if (!shouldReturnToHero()) return;
      event.preventDefault();
      returnToHero();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
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
            Scroll to build
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
