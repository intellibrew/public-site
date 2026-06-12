"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import FactoryBuildExperience from "@/components/FactoryBuildExperience";
import Beams from "@/components/Beams";
import FactoryContactSection from "@/components/FactoryContactSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { IntroducingSection } from "@/components/sections/IntroducingSection";
import { useJourneySnap } from "@/hooks/useJourneySnap";
import { useLenis } from "@/hooks/useLenis";
import { isCompactViewport } from "@/lib/layoutBreakpoints";
import {
  isInFactoryBand,
  JOURNEY,
  JOURNEY_HEIGHT_VH,
  resolveJourneyPhase,
  shouldMountFactory,
  shouldStartFactoryBuild,
  type JourneyPhase,
} from "@/lib/factory/scrollJourney";

const BUILD_DURATION = 5500;

const SCROLL_HINTS: Record<JourneyPhase, string> = {
  hero: "Scroll to explore",
  problem: "Scroll to continue",
  solution: "Scroll to continue",
  factory: "Scroll to explore the factory",
  contact: "",
};

export default function FactoryLanding() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const buildProgressRef = useRef(0);
  const buildCompleteRef = useRef(false);
  const storyEnabledRef = useRef(false);
  const animationStartedRef = useRef(false);
  const factoryPausedRef = useRef(false);
  const dismissOverlaysRef = useRef<(() => void) | null>(null);
  const journeyPhaseRef = useRef<JourneyPhase>("hero");
  const factoryInteractiveRef = useRef(false);
  const hasUserScrolledRef = useRef(false);

  const [factoryMounted, setFactoryMounted] = useState(false);
  const [factoryVisible, setFactoryVisible] = useState(false);
  const [factoryInteractive, setFactoryInteractive] = useState(false);
  const [scenePaused, setScenePaused] = useState(true);
  const [storyEnabled, setStoryEnabled] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [animationActive, setAnimationActive] = useState(false);
  const [journeyPhase, setJourneyPhase] = useState<JourneyPhase>("hero");
  const [scrollReady, setScrollReady] = useState(false);

  const { scrollTo } = useLenis();
  const { scrollToProgress } = useJourneySnap({ journeyRef, enabled: scrollReady });

  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ["start start", "end end"],
  });

  const heroOpacity = useTransform(
    scrollYProgress,
    [0, JOURNEY.hero.fadeOut[0], JOURNEY.hero.fadeOut[1]],
    [1, 1, 0]
  );
  const heroY = useTransform(
    scrollYProgress,
    [0, JOURNEY.hero.fadeOut[0], JOURNEY.hero.fadeOut[1]],
    [0, 0, -20]
  );
  const heroVisibility = useTransform(heroOpacity, (value) =>
    value < 0.04 ? "hidden" : "visible"
  );

  const problemOpacity = useTransform(
    scrollYProgress,
    [JOURNEY.problem.fadeIn[0], JOURNEY.problem.fadeIn[1], JOURNEY.problem.fadeOut[0], JOURNEY.problem.fadeOut[1]],
    [0, 1, 1, 0]
  );
  const problemY = useTransform(
    scrollYProgress,
    [JOURNEY.problem.fadeIn[0], JOURNEY.problem.fadeIn[1], JOURNEY.problem.fadeOut[0], JOURNEY.problem.fadeOut[1]],
    [28, 0, 0, -18]
  );
  const problemVisibility = useTransform(problemOpacity, (value) =>
    value < 0.04 ? "hidden" : "visible"
  );

  const solutionOpacity = useTransform(
    scrollYProgress,
    [JOURNEY.solution.fadeIn[0], JOURNEY.solution.fadeIn[1], JOURNEY.solution.fadeOut[0], JOURNEY.solution.fadeOut[1]],
    [0, 1, 1, 0]
  );
  const solutionY = useTransform(
    scrollYProgress,
    [JOURNEY.solution.fadeIn[0], JOURNEY.solution.fadeIn[1], JOURNEY.solution.fadeOut[0], JOURNEY.solution.fadeOut[1]],
    [28, 0, 0, -18]
  );
  const solutionVisibility = useTransform(solutionOpacity, (value) =>
    value < 0.04 ? "hidden" : "visible"
  );

  const factoryOpacity = useTransform(
    scrollYProgress,
    [JOURNEY.factory.fadeIn[0], JOURNEY.factory.fadeIn[1], JOURNEY.factory.fadeOut[0], JOURNEY.factory.fadeOut[1]],
    [0, 1, 1, 0]
  );
  const factoryVisibility = useTransform(factoryOpacity, (value) =>
    value < 0.04 ? "hidden" : "visible"
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
    if (!hasUserScrolledRef.current && progress > 0.002) {
      return;
    }

    const phase = resolveJourneyPhase(progress);
    if (phase !== journeyPhaseRef.current) {
      journeyPhaseRef.current = phase;
      setJourneyPhase(phase);
    }

    const inFactory = isInFactoryBand(progress);
    const canMountFactory = shouldMountFactory(progress, hasUserScrolledRef.current);

    if (canMountFactory) {
      setFactoryMounted(true);
    }

    setFactoryVisible((prev) => (prev === canMountFactory ? prev : canMountFactory));

    const nextPaused = !inFactory;
    if (factoryPausedRef.current !== nextPaused) {
      factoryPausedRef.current = nextPaused;
      setScenePaused(nextPaused);
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
    const check = () => setIsCompact(isCompactViewport());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!animationActive) return;

    let frameId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      buildProgressRef.current = Math.min(1, elapsed / BUILD_DURATION);

      if (buildProgressRef.current >= 1) {
        buildProgressRef.current = 1;
        buildCompleteRef.current = true;
        storyEnabledRef.current = true;
        setStoryEnabled(true);
        const interactive = isInFactoryBand(scrollYProgress.get());
        factoryInteractiveRef.current = interactive;
        setFactoryInteractive(interactive);
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [animationActive, scrollYProgress]);

  const showHeroBeams = journeyPhase === "hero";
  const showScrollHint = journeyPhase !== "contact" && SCROLL_HINTS[journeyPhase].length > 0;

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
        style={{ ["--factory-journey-vh" as string]: String(JOURNEY_HEIGHT_VH) }}
      >
        <div className="factory-experience-stage" aria-label="NeoFab scroll experience">
          <div aria-hidden className="factory-page-atmosphere absolute inset-0" />

          <motion.div
            className="factory-scroll-layer factory-scroll-layer--factory"
            style={{ opacity: factoryOpacity, visibility: factoryVisibility }}
          >
            {factoryMounted && (
              <div
                className={`absolute inset-0 ${factoryInteractive ? "pointer-events-auto" : "pointer-events-none"}`}
                style={{ visibility: factoryVisible ? "visible" : "hidden" }}
              >
                <FactoryBuildExperience
                  getBuildProgress={getBuildProgress}
                  getStoryEnabled={getStoryEnabled}
                  storyEnabled={storyEnabled && factoryInteractive}
                  simplified={isCompact}
                  scenePaused={scenePaused}
                  getScenePaused={getScenePaused}
                  sceneInteractive={factoryInteractive}
                  showReturnToHero={storyEnabled && factoryInteractive}
                  onReturnToHero={scrollToTop}
                  dismissOverlaysRef={dismissOverlaysRef}
                />
              </div>
            )}
          </motion.div>

          <motion.div
            className="factory-scroll-layer factory-scroll-layer--problem"
            style={{ opacity: problemOpacity, y: problemY, visibility: problemVisibility }}
          >
            <ProblemSection embedded />
          </motion.div>

          <motion.div
            className="factory-scroll-layer factory-scroll-layer--solution"
            style={{ opacity: solutionOpacity, y: solutionY, visibility: solutionVisibility }}
          >
            <IntroducingSection embedded />
          </motion.div>

          <motion.div
            className="factory-scroll-layer factory-scroll-layer--hero factory-hero-overlay"
            style={{ opacity: heroOpacity, y: heroY, visibility: heroVisibility }}
          >
            {showHeroBeams && (
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
            </div>
          </motion.div>

          <motion.div
            className={`factory-scroll-layer factory-scroll-layer--contact ${
              journeyPhase === "contact" ? "factory-scroll-layer--interactive" : ""
            }`}
            style={{ opacity: contactOpacity, y: contactY, visibility: contactVisibility }}
          >
            <FactoryContactSection embedded />
          </motion.div>

          {showScrollHint && (
            <p className="factory-scroll-hint font-fragment text-[10px] uppercase tracking-[0.24em] text-teal-400/55 sm:text-[11px] sm:tracking-[0.28em]">
              {SCROLL_HINTS[journeyPhase]}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
