"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import FactoryBuildExperience from "@/components/FactoryBuildExperience";
import Beams from "@/components/Beams";
import FactoryContactCue from "@/components/FactoryContactCue";
import { isCompactViewport } from "@/lib/layoutBreakpoints";

const HERO_FADE_DURATION = 600;
const HERO_RETURN_FADE_MS = 420;
const HERO_LEAVE_FADE_MS = 320;
const BUILD_DURATION = 5500;
const SCROLL_TRIGGER_PX = 30;

export default function FactoryLanding() {
  const buildProgressRef = useRef(0);
  const buildCompleteRef = useRef(false);
  const storyEnabledRef = useRef(false);
  const animationStartedRef = useRef(false);
  const heroResumeLockRef = useRef(false);
  const heroScrollBridgeRef = useRef<HTMLDivElement>(null);
  const heroShownRef = useRef(true);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const dismissOverlaysRef = useRef<(() => void) | null>(null);
  const heroFadeCancelRef = useRef<(() => void) | null>(null);
  const factoryPausedRef = useRef(false);

  const [factoryVisible, setFactoryVisible] = useState(false);
  const [factoryInteractive, setFactoryInteractive] = useState(false);
  const [scenePaused, setScenePaused] = useState(false);
  const [buildComplete, setBuildComplete] = useState(false);
  const [storyEnabled, setStoryEnabled] = useState(false);
  const [heroHidden, setHeroHidden] = useState(false);
  const [heroResting, setHeroResting] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [animationActive, setAnimationActive] = useState(false);
  const [hasEnteredFactory, setHasEnteredFactory] = useState(false);

  const getBuildProgress = useCallback(() => buildProgressRef.current, []);
  const getStoryEnabled = useCallback(() => storyEnabledRef.current, []);

  const applyHeroFrame = useCallback((opacity: number) => {
    const overlay = heroOverlayRef.current;
    if (overlay) {
      overlay.style.opacity = opacity.toFixed(3);
      overlay.style.visibility = opacity < 0.02 ? "hidden" : "visible";
    }

    const content = heroContentRef.current;
    if (content) {
      content.style.transform = `translateY(${(1 - opacity) * -12}px) scale(${
        0.985 + opacity * 0.015
      })`;
    }
  }, []);

  const runHeroFade = useCallback(
    (from: number, to: number, durationMs: number, onDone?: () => void) => {
      heroFadeCancelRef.current?.();
      const start = performance.now();
      let frameId = 0;
      let last = from;

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - (1 - t) * (1 - t);
        const opacity = from + (to - from) * eased;
        if (Math.abs(opacity - last) > 0.005) {
          last = opacity;
          applyHeroFrame(opacity);
        }
        if (t < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          applyHeroFrame(to);
          onDone?.();
        }
      };

      frameId = requestAnimationFrame(step);
      heroFadeCancelRef.current = () => cancelAnimationFrame(frameId);
    },
    [applyHeroFrame]
  );

  const revealHero = useCallback(() => {
    if (!buildCompleteRef.current || heroShownRef.current) return;

    dismissOverlaysRef.current?.();
    factoryPausedRef.current = true;
    setScenePaused(true);
    heroShownRef.current = true;
    setHeroHidden(false);
    setFactoryInteractive(false);
    setHeroResting(true);
    heroResumeLockRef.current = false;
    window.scrollTo({ top: 0, behavior: "auto" });
    applyHeroFrame(0);
    runHeroFade(0, 1, HERO_RETURN_FADE_MS);
  }, [applyHeroFrame, runHeroFade]);

  const resumeFactory = useCallback(() => {
    if (!buildCompleteRef.current || !heroShownRef.current) return;

    runHeroFade(1, 0, HERO_LEAVE_FADE_MS, () => {
      heroShownRef.current = false;
      setHeroHidden(true);
      setFactoryInteractive(true);
      setHeroResting(false);
      factoryPausedRef.current = false;
      setScenePaused(false);
    });
  }, [runHeroFade]);

  const getScenePaused = useCallback(() => factoryPausedRef.current, []);
  const showHeroBeams = !heroHidden && (!animationActive || heroResting);
  const heroScrollGateOpen =
    (!animationActive && !hasEnteredFactory) || (heroResting && buildComplete);

  const tryAdvanceFromHeroScroll = useCallback(() => {
    if (window.scrollY < SCROLL_TRIGGER_PX) return;

    if (heroResting && buildCompleteRef.current && !heroResumeLockRef.current) {
      heroResumeLockRef.current = true;
      resumeFactory();
      return;
    }

    if (!animationStartedRef.current) {
      animationStartedRef.current = true;
      setHasEnteredFactory(true);
      setAnimationActive(true);
    }
  }, [heroResting, resumeFactory]);

  useEffect(() => {
    const check = () => {
      setIsCompact(isCompactViewport());
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!heroScrollGateOpen) return;

    const onScroll = () => tryAdvanceFromHeroScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    tryAdvanceFromHeroScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [heroScrollGateOpen, tryAdvanceFromHeroScroll]);

  useEffect(() => {
    const bridge = heroScrollBridgeRef.current;
    if (!bridge || !heroScrollGateOpen) return;

    const onWheel = (event: WheelEvent) => {
      window.scrollBy({ top: event.deltaY, left: 0, behavior: "auto" });
    };

    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY;
      if (y == null) return;
      const delta = touchStartY - y;
      if (Math.abs(delta) < 0.5) return;
      touchStartY = y;
      window.scrollBy({ top: delta, left: 0, behavior: "auto" });
    };

    bridge.addEventListener("wheel", onWheel, { passive: true });
    bridge.addEventListener("touchstart", onTouchStart, { passive: true });
    bridge.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      bridge.removeEventListener("wheel", onWheel);
      bridge.removeEventListener("touchstart", onTouchStart);
      bridge.removeEventListener("touchmove", onTouchMove);
    };
  }, [heroScrollGateOpen]);

  useEffect(() => {
    if (!animationActive) return;

    let frameId = 0;
    let heroOpacityValue = 1;
    const startTime = performance.now();

    setFactoryVisible(true);
    applyHeroFrame(1);

    const tick = (now: number) => {
      const elapsed = now - startTime;

      const heroT = Math.min(1, elapsed / HERO_FADE_DURATION);
      const heroEased = 1 - (1 - heroT) * (1 - heroT);
      const nextHeroOpacity = Math.max(0, 1 - heroEased);
      if (Math.abs(heroOpacityValue - nextHeroOpacity) > 0.005) {
        heroOpacityValue = nextHeroOpacity;
        applyHeroFrame(nextHeroOpacity);
      }

      buildProgressRef.current = Math.min(1, elapsed / BUILD_DURATION);

      if (buildProgressRef.current >= 1) {
        buildProgressRef.current = 1;
        buildCompleteRef.current = true;
        heroOpacityValue = 0;
        heroShownRef.current = false;
        applyHeroFrame(0);
        storyEnabledRef.current = true;
        setStoryEnabled(true);
        setFactoryInteractive(true);
        setHeroHidden(true);
        setBuildComplete(true);
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [animationActive, applyHeroFrame]);

  useEffect(
    () => () => {
      heroFadeCancelRef.current?.();
    },
    []
  );

  return (
    <main className="factory-landing relative bg-[#050708] text-white">
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
          simplified={isCompact}
          scenePaused={scenePaused}
          getScenePaused={getScenePaused}
          sceneInteractive={factoryInteractive}
          showReturnToHero={buildComplete && factoryInteractive}
          onReturnToHero={revealHero}
          dismissOverlaysRef={dismissOverlaysRef}
        />
      </div>

      {heroScrollGateOpen && (
        <div
          ref={heroScrollBridgeRef}
          className="factory-hero-scroll-bridge fixed inset-0 z-[15]"
          aria-hidden
        />
      )}

      <div
        ref={heroOverlayRef}
        className="factory-hero-overlay pointer-events-none fixed inset-0 z-20 bg-[#050708]"
        style={{
          opacity: heroHidden ? 0 : 1,
          visibility: heroHidden ? "hidden" : "visible",
        }}
      >
        <div
          aria-hidden
          className="hero-beams-layer absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            opacity: showHeroBeams ? 0.7 : 0,
            visibility: showHeroBeams ? "visible" : "hidden",
          }}
        >
          <Beams
            active={showHeroBeams}
            beamWidth={isCompact ? 2.5 : 3}
            beamHeight={isCompact ? 26 : 30}
            beamNumber={isCompact ? 16 : 20}
            lightColor="#22c59d"
            speed={2}
            noiseIntensity={isCompact ? 0.75 : 1.75}
            scale={isCompact ? 0.18 : 0.2}
            rotation={30}
          />
        </div>
        <div aria-hidden className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,7,8,0.28)_48%,#050708_88%)]" />

        <div
          ref={heroContentRef}
          className="factory-hero-content relative z-10 min-h-0 flex-1"
          style={{
            transform: heroHidden ? "translateY(-12px) scale(0.985)" : "translateY(0px) scale(1)",
          }}
        >
          <div className="factory-hero-inner">
            <p className="factory-hero-kicker mb-3 font-fragment uppercase text-teal-300/70 sm:mb-4">
              NeoFab · AI factory planning
            </p>
            <h1 className="factory-hero-title font-orbitron leading-[1.02] tracking-tight">
              <span className="block text-white">Plan your factory</span>
              <span className="factory-hero-title-accent mt-1 block text-teal-300">
                in hours, not weeks
              </span>
            </h1>
          </div>

          {!animationActive && (
            <p className="factory-scroll-hint font-fragment text-[10px] uppercase tracking-[0.24em] text-teal-400/55 sm:text-[11px] sm:tracking-[0.28em]">
              Scroll to enter
            </p>
          )}
          {heroResting && (
            <p className="factory-scroll-hint font-fragment text-[10px] uppercase tracking-[0.24em] text-teal-400/55 sm:text-[11px] sm:tracking-[0.28em]">
              Scroll to return
            </p>
          )}
        </div>
      </div>

      <div
        className={`relative z-0 ${
          heroResting || !hasEnteredFactory
            ? "factory-scroll-spacer--enter"
            : "factory-scroll-spacer--rest"
        }`}
        aria-hidden
      />

      <FactoryContactCue />
    </main>
  );
}
