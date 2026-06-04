"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import FactoryBuildExperience from "@/components/FactoryBuildExperience";
import Beams from "@/components/Beams";

const HERO_FADE_DURATION = 600;
const BUILD_DURATION = 5500;
const PHONE_BREAKPOINT = 640;
const SCROLL_TRIGGER_PX = 30;

export default function FactoryLanding() {
  const buildProgressRef = useRef(0);
  const buildCompleteRef = useRef(false);
  const storyEnabledRef = useRef(false);
  const animationStartedRef = useRef(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [factoryVisible, setFactoryVisible] = useState(false);
  const [factoryInteractive, setFactoryInteractive] = useState(false);
  const [storyEnabled, setStoryEnabled] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [animationActive, setAnimationActive] = useState(false);
  const getBuildProgress = useCallback(() => buildProgressRef.current, []);
  const getStoryEnabled = useCallback(() => storyEnabledRef.current, []);

  useEffect(() => {
    const check = () => {
      setIsPhone(window.innerWidth < PHONE_BREAKPOINT);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (animationStartedRef.current) return;
      if (window.scrollY < SCROLL_TRIGGER_PX) return;

      animationStartedRef.current = true;
      window.removeEventListener("scroll", onScroll);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

      setAnimationActive(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!animationActive) return;

    let frameId = 0;
    let heroOpacityValue = 1;
    const startTime = performance.now();

    setFactoryVisible(true);

    const tick = (now: number) => {
      const elapsed = now - startTime;

      const heroT = Math.min(1, elapsed / HERO_FADE_DURATION);
      const heroEased = 1 - (1 - heroT) * (1 - heroT);
      const nextHeroOpacity = Math.max(0, 1 - heroEased);
      if (Math.abs(heroOpacityValue - nextHeroOpacity) > 0.005) {
        heroOpacityValue = nextHeroOpacity;
        setHeroOpacity(nextHeroOpacity);
      }

      buildProgressRef.current = Math.min(1, elapsed / BUILD_DURATION);

      if (buildProgressRef.current >= 1) {
        buildProgressRef.current = 1;
        buildCompleteRef.current = true;
        heroOpacityValue = 0;
        setHeroOpacity(0);
        storyEnabledRef.current = true;
        setStoryEnabled(true);
        setFactoryInteractive(true);
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [animationActive]);

  return (
    <main className="relative bg-[#050708] text-white">
      <Header overlay transparent minimal />

      <div
        className={`fixed inset-0 z-10 ${factoryInteractive ? "" : "pointer-events-none"}`}
        style={{
          opacity: factoryVisible ? 1 : 0,
          visibility: factoryVisible ? "visible" : "hidden",
        }}
      >
        <FactoryBuildExperience
          getBuildProgress={getBuildProgress}
          getStoryEnabled={getStoryEnabled}
          storyEnabled={storyEnabled}
          simplified={isPhone}
        />
      </div>

      <div
        className="pointer-events-none fixed inset-0 z-20 bg-[#050708]"
        style={{
          opacity: heroOpacity,
          visibility: heroOpacity < 0.02 ? "hidden" : "visible",
        }}
      >
        <div aria-hidden className="absolute inset-0 z-0 opacity-70">
          <Beams
            beamWidth={3}
            beamHeight={30}
            beamNumber={20}
            lightColor="#22c59d"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={30}
          />
        </div>
        <div aria-hidden className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,7,8,0.28)_48%,#050708_88%)]" />

        <div
          className="relative z-10 flex h-full flex-col justify-center px-6 pt-[70px] md:px-10 lg:px-16"
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

          {!animationActive && (
            <p className="absolute inset-x-0 bottom-10 text-center font-fragment text-[9px] uppercase tracking-[0.28em] text-teal-400/55">
              Scroll to enter
            </p>
          )}
        </div>
      </div>

      <div
        className="relative z-0"
        style={{ height: animationActive ? "100svh" : "220svh" }}
        aria-hidden
      />
    </main>
  );
}
