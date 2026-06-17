"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import FactoryBuildExperience from "@/components/FactoryBuildExperience";
import Beams from "@/components/Beams";
import FactoryContactSection from "@/components/FactoryContactSection";
import { FactoryHeroTitle } from "@/components/FactoryHeroTitle";
import { StitchedStorySection } from "@/components/sections/StitchedStorySection";
import { CustomersClientsSection } from "@/components/sections/CustomersClientsSection";
import { useJourneySnap } from "@/hooks/useJourneySnap";
import { useLenis } from "@/hooks/useLenis";
import {
  isCompactViewport,
  isPhoneViewport,
  prefersNativeTouchScroll,
} from "@/lib/layoutBreakpoints";
import {
  isFactoryPhase,
  JOURNEY,
  JOURNEY_HEIGHT_VH,
  JOURNEY_PHONE_HEIGHT_VH,
  JOURNEY_TABLET_HEIGHT_VH,
  resolveJourneyPhase,
  shouldMountFactory,
  shouldStartFactoryBuild,
  type JourneyPhase,
} from "@/lib/factory/scrollJourney";
import { easeInOutCubic } from "@/lib/factory/math";

const BUILD_DURATION_MS = 6800;
const HERO_SCROLL_HINT = "Scroll to explore";

export default function FactoryLanding() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const buildProgressRef = useRef(0);
  const buildLinearRef = useRef(0);
  const buildCompleteRef = useRef(false);
  const storyEnabledRef = useRef(false);
  const animationStartedRef = useRef(false);
  const factoryPausedRef = useRef(false);
  const dismissOverlaysRef = useRef<(() => void) | null>(null);
  const journeyPhaseRef = useRef<JourneyPhase>("hero");
  const factoryInteractiveRef = useRef(false);
  const hasUserScrolledRef = useRef(false);

  const [factoryMounted, setFactoryMounted] = useState(false);
  const [factoryInteractive, setFactoryInteractive] = useState(false);
  const [scenePaused, setScenePaused] = useState(true);
  const [storyEnabled, setStoryEnabled] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [prefersNativeTouch, setPrefersNativeTouch] = useState(() =>
    typeof window !== "undefined" ? prefersNativeTouchScroll() : false
  );
  const [animationActive, setAnimationActive] = useState(false);
  const [journeyPhase, setJourneyPhase] = useState<JourneyPhase>("hero");
  const [scrollReady, setScrollReady] = useState(false);
  const [showHeroChrome, setShowHeroChrome] = useState(true);

  const { scrollTo } = useLenis();
  const { scrollToProgress } = useJourneySnap({
    journeyRef,
    enabled: scrollReady && !prefersNativeTouch,
    aggressive: false,
  });

  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ["start start", "end end"],
  });

  const heroVisible = useTransform(
    scrollYProgress,
    (progress) => (progress < JOURNEY.hero.fadeOut[1] ? "visible" : "hidden")
  );
  const heroZIndex = useTransform(scrollYProgress, [0, 0.06, JOURNEY.hero.fadeOut[1]], [20, 20, 8]);

  const storyOpacity = useTransform(
    scrollYProgress,
    [JOURNEY.problem.fadeIn[0], JOURNEY.problem.fadeIn[1], JOURNEY.solution.fadeOut[0], JOURNEY.solution.fadeOut[1]],
    [0, 1, 1, 0]
  );
  const storyY = useTransform(
    scrollYProgress,
    [JOURNEY.problem.fadeIn[0], JOURNEY.problem.fadeIn[1], JOURNEY.solution.fadeOut[0], JOURNEY.solution.fadeOut[1]],
    [20, 0, 0, -16]
  );
  const storyVisibility = useTransform(storyOpacity, (value) =>
    value < 0.02 ? "hidden" : "visible"
  );

  const factoryOpacity = useTransform(scrollYProgress, (progress) => {
    if (progress < JOURNEY.factory.fadeIn[1]) return 0;
    if (progress < JOURNEY.problem.fadeIn[0]) return 1;
    return 0;
  });

  const customersOpacity = useTransform(
    scrollYProgress,
    [
      JOURNEY.customers.fadeIn[0],
      JOURNEY.customers.fadeIn[1],
      JOURNEY.customers.fadeOut[0],
      JOURNEY.customers.fadeOut[1],
    ],
    [0, 1, 1, 0]
  );
  const customersY = useTransform(
    scrollYProgress,
    [
      JOURNEY.customers.fadeIn[0],
      JOURNEY.customers.fadeIn[1],
      JOURNEY.customers.fadeOut[0],
      JOURNEY.customers.fadeOut[1],
    ],
    [20, 0, 0, -16]
  );
  const customersVisibility = useTransform(customersOpacity, (value) =>
    value < 0.02 ? "hidden" : "visible"
  );

  const contactOpacity = useTransform(
    scrollYProgress,
    [JOURNEY.contact.fadeIn[0], JOURNEY.contact.fadeIn[1], 1],
    [0, 1, 1]
  );
  const contactY = useTransform(
    scrollYProgress,
    [JOURNEY.contact.fadeIn[0], JOURNEY.contact.fadeIn[1]],
    [24, 0]
  );
  const contactVisibility = useTransform(contactOpacity, (value) =>
    value < 0.04 ? "hidden" : "visible"
  );

  const getBuildProgress = useCallback(() => buildProgressRef.current, []);
  const getStoryEnabled = useCallback(() => storyEnabledRef.current, []);
  const getScenePaused = useCallback(() => factoryPausedRef.current, []);

  const scrollToTop = useCallback(() => {
    dismissOverlaysRef.current?.();
    scrollToProgress(0, 0.85);
  }, [scrollToProgress]);

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    scrollTo(0, { immediate: true });
    const frameId = requestAnimationFrame(() => {
      setScrollReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [scrollTo]);

  useEffect(() => {
    const markUserScroll = () => {
      hasUserScrolledRef.current = true;
    };

    window.addEventListener("wheel", markUserScroll, { passive: true });
    window.addEventListener("touchmove", markUserScroll, { passive: true });
    window.addEventListener("keydown", markUserScroll);

    return () => {
      window.removeEventListener("wheel", markUserScroll);
      window.removeEventListener("touchmove", markUserScroll);
      window.removeEventListener("keydown", markUserScroll);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setShowHeroChrome(progress < JOURNEY.hero.fadeOut[1]);

    if (!hasUserScrolledRef.current && progress > 0.002) {
      return;
    }

    const phase = resolveJourneyPhase(progress);
    if (phase !== journeyPhaseRef.current) {
      journeyPhaseRef.current = phase;
      setJourneyPhase(phase);
    }

    const inFactory = isFactoryPhase(progress);
    const canMountFactory = shouldMountFactory(progress, hasUserScrolledRef.current);

    if (canMountFactory) {
      setFactoryMounted(true);
    }

    const nextPaused = !inFactory;
    if (factoryPausedRef.current !== nextPaused) {
      factoryPausedRef.current = nextPaused;
      setScenePaused(nextPaused);
      if (nextPaused) {
        dismissOverlaysRef.current?.();
      }
    }

    const nextInteractive = inFactory && buildCompleteRef.current;
    if (factoryInteractiveRef.current !== nextInteractive) {
      factoryInteractiveRef.current = nextInteractive;
      setFactoryInteractive(nextInteractive);
    }

    if (
      shouldStartFactoryBuild(progress, hasUserScrolledRef.current) &&
      !animationStartedRef.current
    ) {
      animationStartedRef.current = true;
      setAnimationActive(true);
    }
  });

  useEffect(() => {
    const check = () => {
      setIsCompact(isCompactViewport());
      setIsPhone(isPhoneViewport());
      setPrefersNativeTouch(prefersNativeTouchScroll());
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  useEffect(() => {
    if (!animationActive) return;

    let frameId = 0;
    let lastFrameAt = performance.now();

    const onVisibilityChange = () => {
      lastFrameAt = performance.now();
    };

    const tick = (now: number) => {
      const delta = Math.min(100, Math.max(0, now - lastFrameAt));
      lastFrameAt = now;

      const shouldAdvanceBuild =
        document.visibilityState === "visible" && !factoryPausedRef.current;

      if (shouldAdvanceBuild) {
        buildLinearRef.current = Math.min(
          1,
          buildLinearRef.current + delta / BUILD_DURATION_MS
        );
        buildProgressRef.current = easeInOutCubic(buildLinearRef.current);
      }

      if (buildLinearRef.current >= 1) {
        buildLinearRef.current = 1;
        buildProgressRef.current = 1;
        buildCompleteRef.current = true;
        storyEnabledRef.current = true;
        setStoryEnabled(true);
        const interactive = isFactoryPhase(scrollYProgress.get());
        factoryInteractiveRef.current = interactive;
        setFactoryInteractive(interactive);
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    frameId = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelAnimationFrame(frameId);
    };
  }, [animationActive, scrollYProgress]);

  const showScrollHint = showHeroChrome;
  const journeyHeightVh = isPhone
    ? JOURNEY_PHONE_HEIGHT_VH
    : isCompact
      ? JOURNEY_TABLET_HEIGHT_VH
      : JOURNEY_HEIGHT_VH;

  return (
    <main
      className={`factory-landing relative text-white ${
        journeyPhase === "factory" ? "" : "factory-landing--on-hero"
      }`}
    >
      <Header overlay transparent minimal />

      <div
        ref={journeyRef}
        className="factory-scroll-journey"
        style={{ ["--factory-journey-vh" as string]: String(journeyHeightVh) }}
      >
        <div
          className="factory-experience-stage"
          aria-label="NeoFab scroll experience"
        >
          <div aria-hidden className="factory-page-atmosphere absolute inset-0" />

          <motion.div
            className={`factory-scroll-layer factory-scroll-layer--factory ${
              journeyPhase === "factory" ? "factory-scroll-layer--native-scroll" : ""
            }`}
            data-lenis-prevent={journeyPhase === "factory" ? "" : undefined}
            style={{ opacity: factoryOpacity }}
          >
            {factoryMounted && (
              <div
                className={`absolute inset-0 ${factoryInteractive ? "pointer-events-auto" : "pointer-events-none"}`}
              >
                <FactoryBuildExperience
                  getBuildProgress={getBuildProgress}
                  getStoryEnabled={getStoryEnabled}
                  storyEnabled={storyEnabled && factoryInteractive}
                  simplified={isCompact}
                  scenePaused={scenePaused}
                  getScenePaused={getScenePaused}
                  sceneInteractive={factoryInteractive}
                  preferPageScroll={prefersNativeTouch}
                  showReturnToHero={false}
                  onReturnToHero={scrollToTop}
                  dismissOverlaysRef={dismissOverlaysRef}
                />
              </div>
            )}
          </motion.div>

          <motion.div
            className="factory-scroll-layer factory-scroll-layer--story"
            style={{ opacity: storyOpacity, y: storyY, visibility: storyVisibility }}
          >
            <StitchedStorySection scrollProgress={scrollYProgress} />
          </motion.div>

          <motion.div
            className={`factory-scroll-layer factory-scroll-layer--customers ${
              journeyPhase === "customers" ? "factory-scroll-layer--interactive" : ""
            }`}
            style={{ opacity: customersOpacity, y: customersY, visibility: customersVisibility }}
          >
            <CustomersClientsSection embedded />
          </motion.div>

          <motion.div
            className="factory-scroll-layer factory-scroll-layer--hero factory-hero-overlay"
            style={{ visibility: heroVisible, zIndex: heroZIndex }}
          >
            {showHeroChrome && (
              <div aria-hidden className="hero-beams-layer absolute inset-0 z-0 opacity-70">
                <Beams
                  active
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
            )}
            <div
              aria-hidden
              className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,7,8,0.28)_48%,#050708_88%)]"
            />

            <div className="factory-hero-content relative z-10 min-h-0 flex-1">
              <div className="factory-hero-inner">
                {showHeroChrome && (
                  <p className="factory-hero-kicker mb-3 font-fragment uppercase text-teal-300/70 sm:mb-4">
                    NeoFab · AI factory planning
                  </p>
                )}
                <FactoryHeroTitle scrollProgress={scrollYProgress} scrollReady={scrollReady} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`factory-scroll-layer factory-scroll-layer--contact ${
              journeyPhase === "contact" ? "factory-scroll-layer--interactive" : ""
            }`}
            style={{ opacity: contactOpacity, y: contactY, visibility: contactVisibility }}
          >
            <FactoryContactSection embedded scrollProgress={scrollYProgress} />
          </motion.div>

          {showScrollHint && (
            <p className="factory-scroll-hint font-fragment text-[10px] uppercase tracking-[0.24em] text-teal-400/55 sm:text-[11px] sm:tracking-[0.28em]">
              {HERO_SCROLL_HINT}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
