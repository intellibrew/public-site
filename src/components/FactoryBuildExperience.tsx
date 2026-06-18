"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FC, PropsWithChildren } from "react";
import FactoryThreeScene, {
  type FocusPhase,
} from "@/components/FactoryThreeScene";
import FactoryFlowStoryCard from "@/components/FactoryFlowStoryCard";
import FactoryStoryActions from "@/components/FactoryStoryActions";
import MachineHologramOverlay from "@/components/MachineHologramOverlay";
import SubstationOverlay from "@/components/SubstationOverlay";
import { MACHINE_MAP } from "@/lib/factory/machineRegistry";
import { POWER_SUBSTATION_ID } from "@/lib/factory/powerSubstation";
import {
  advanceStorySnapshot,
  computeFlowState,
  flowCaption,
  initialStorySnapshot,
  OPTIMIZING_DURATION_MS,
  pickRandomBottleneckStationId,
  type StoryPhase,
  type StorySnapshot,
} from "@/lib/factory/flowOptimization";
import { isPhoneViewport } from "@/lib/layoutBreakpoints";
import { useFactoryStoryAutoplay } from "@/hooks/useFactoryStoryAutoplay";

const SafeAnimatePresence = AnimatePresence as FC<
  PropsWithChildren<{ mode?: "wait" | "sync" | "popLayout" }>
>;

type FactoryBuildExperienceProps = {
  getBuildProgress: () => number;
  getStoryEnabled: () => boolean;
  storyEnabled?: boolean;
  simplified?: boolean;
  scenePaused?: boolean;
  getScenePaused?: () => boolean;
  sceneInteractive?: boolean;
  preferPageScroll?: boolean;
  showReturnToHero?: boolean;
  onReturnToHero?: () => void;
  dismissOverlaysRef?: React.MutableRefObject<(() => void) | null>;
};

export default function FactoryBuildExperience({
  getBuildProgress,
  getStoryEnabled,
  storyEnabled = false,
  simplified = false,
  scenePaused = false,
  getScenePaused,
  sceneInteractive = false,
  preferPageScroll = false,
  showReturnToHero = false,
  onReturnToHero,
  dismissOverlaysRef,
}: FactoryBuildExperienceProps) {
  const bottleneckStationId = useMemo(() => pickRandomBottleneckStationId(), []);
  const constraintName = MACHINE_MAP.get(bottleneckStationId)?.name ?? bottleneckStationId;

  const [focusedStation, setFocusedStation] = useState<string | null>(null);
  const [focusPhase, setFocusPhase] = useState<FocusPhase>("idle");
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const [storyPhase, setStoryPhase] = useState<StoryPhase>("underproduction");
  const [flowCaptionText, setFlowCaptionText] = useState<{ label: string; detail: string } | null>(
    null
  );
  const [isPhone, setIsPhone] = useState(false);

  const focusRequestRef = useRef<
    ((id: string | null, options?: { immediate?: boolean }) => void) | null
  >(null);
  const storyRef = useRef<StorySnapshot>(
    initialStorySnapshot(performance.now(), bottleneckStationId)
  );
  const pauseStartedAtRef = useRef<number | null>(null);
  const isFocusActive = focusPhase !== "idle";
  const isSubstationFocus = focusedStation === POWER_SUBSTATION_ID;
  const storyAnalysisEnabled = storyEnabled;

  const isBottleneckAlert =
    storyAnalysisEnabled &&
    storyPhase === "bottleneck" &&
    focusedStation === bottleneckStationId &&
    focusPhase !== "idle";

  const handleFocusChange = useCallback((stationId: string | null, phase: FocusPhase) => {
    setFocusedStation(stationId);
    setFocusPhase(phase);
  }, []);

  const handleCloseFocus = useCallback(() => {
    focusRequestRef.current?.(null);
  }, []);

  const dismissOverlays = useCallback(() => {
    focusRequestRef.current?.(null, { immediate: true });
    setFocusedStation(null);
    setFocusPhase("idle");
  }, []);

  useEffect(() => {
    if (!dismissOverlaysRef) return;
    dismissOverlaysRef.current = dismissOverlays;
    return () => {
      dismissOverlaysRef.current = null;
    };
  }, [dismissOverlays, dismissOverlaysRef]);

  const handleStationHover = useCallback((stationId: string | null) => {
    setHoveredStation(stationId);
  }, []);

  const handleOptimizeFactory = useCallback(() => {
    storyRef.current = advanceStorySnapshot(storyRef.current, "optimizing");
    setStoryPhase("optimizing");
    setFocusedStation(null);
    setFocusPhase("idle");
    focusRequestRef.current?.(null, { immediate: true });
  }, []);

  const handleIdentifyBottlenecks = useCallback(() => {
    if (storyRef.current.phase !== "underproduction") return;
    storyRef.current = advanceStorySnapshot(storyRef.current, "bottleneck", performance.now() - 180);
    setStoryPhase("bottleneck");
  }, []);

  const {
    identifyPressed,
    optimizePressed,
    stationTargeting,
    autoplayActive,
  } = useFactoryStoryAutoplay({
    enabled: storyAnalysisEnabled,
    scenePaused,
    bottleneckStationId,
    focusRequestRef,
    onIdentifyBottlenecks: handleIdentifyBottlenecks,
    onOptimizeFactory: handleOptimizeFactory,
  });

  useEffect(() => {
    const check = () => setIsPhone(isPhoneViewport());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!scenePaused) {
      if (pauseStartedAtRef.current !== null) {
        const pausedFor = performance.now() - pauseStartedAtRef.current;
        storyRef.current = {
          ...storyRef.current,
          phaseStartedAt: storyRef.current.phaseStartedAt + pausedFor,
        };
        pauseStartedAtRef.current = null;
      }
      return;
    }

    if (pauseStartedAtRef.current === null) {
      pauseStartedAtRef.current = performance.now();
    }
  }, [scenePaused]);

  useEffect(() => {
    if (!storyAnalysisEnabled || scenePaused) return;
    if (storyPhase !== "optimizing") return;
    const elapsed = performance.now() - storyRef.current.phaseStartedAt;
    const remaining = Math.max(0, OPTIMIZING_DURATION_MS - elapsed);
    const optimizedTimer = window.setTimeout(() => {
      storyRef.current = advanceStorySnapshot(storyRef.current, "optimized");
      setStoryPhase("optimized");
    }, remaining);
    return () => window.clearTimeout(optimizedTimer);
  }, [storyAnalysisEnabled, storyPhase, scenePaused]);

  useEffect(() => {
    if (!storyAnalysisEnabled) return;

    const flow = computeFlowState(storyRef.current, performance.now());
    setStoryPhase(storyRef.current.phase);
    setFlowCaptionText(flowCaption(flow, storyRef.current));
  }, [storyAnalysisEnabled, storyPhase]);

  const hintText = (() => {
    if (isFocusActive) return null;
    if (stationTargeting) {
      return isPhone
        ? `Opening ${constraintName}…`
        : `Opening stalled ${constraintName} station…`;
    }
    if (storyPhase === "bottleneck" && autoplayActive) {
      return isPhone
        ? `Constraint at ${constraintName}`
        : `Constraint detected at ${constraintName}`;
    }
    if (storyPhase === "bottleneck") {
      return hoveredStation === bottleneckStationId
        ? "Opening bottleneck report"
        : isPhone
          ? `Stalled at ${constraintName}`
          : `Line stalled at ${constraintName}`;
    }
    if (storyPhase === "optimizing") return "Optimising factory flow…";
    if (storyPhase === "optimized") {
      if (hoveredStation === POWER_SUBSTATION_ID) return "Inspect · Main Distribution";
      return hoveredStation
        ? `Inspect · ${MACHINE_MAP.get(hoveredStation)?.name ?? hoveredStation}`
        : isPhone
          ? "Click any machine to inspect"
          : "Full production flow - click any machine to inspect";
    }
    if (hoveredStation === POWER_SUBSTATION_ID) return "Inspect · Main Distribution";
    return null;
  })();

  return (
    <div
      className={`relative h-full min-h-[100svh] w-full overflow-hidden bg-transparent ${isFocusActive ? "factory-focus-active" : ""}`}
    >
      <div aria-hidden className="factory-scene-backdrop pointer-events-none absolute inset-0 z-0" />
      <div aria-hidden className="factory-ambient-light factory-ambient-light--teal pointer-events-none absolute inset-0 z-[1]" />

      {showReturnToHero && onReturnToHero && !isFocusActive && (
        <button
          type="button"
          onClick={onReturnToHero}
          className="factory-return-hero factory-website-flow-ui pointer-events-auto z-[36]"
          aria-label="Return to hero"
        >
          <svg className="factory-return-hero-icon" viewBox="0 0 12 8" aria-hidden>
            <path
              d="M1.5 6.5L6 2l4.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <div className="factory-stage pointer-events-none relative z-10 h-full w-full overflow-hidden">
        <div
          className={`factory-model-layer ${
            sceneInteractive ? "factory-model-layer--interactive" : ""
          } ${
            sceneInteractive && preferPageScroll ? "factory-model-layer--page-scroll" : ""
          }`}
        >
          <FactoryThreeScene
            getBuildProgress={getBuildProgress}
            getStoryActive={getStoryEnabled}
            getScenePaused={getScenePaused}
            storyRef={storyRef}
            onFocusChange={handleFocusChange}
            onStationHover={handleStationHover}
            focusRequestRef={focusRequestRef}
            simplified={simplified}
            sceneInteractive={sceneInteractive}
            preferPageScroll={preferPageScroll}
          />
        </div>

        <SubstationOverlay
          visible={isFocusActive && isSubstationFocus}
          storyPhase={storyPhase}
          onClose={handleCloseFocus}
        />

        <MachineHologramOverlay
          stationId={focusedStation}
          visible={isFocusActive && !isSubstationFocus}
          variant={isBottleneckAlert ? "bottleneck" : "inspect"}
          showBottleneckAnalysis
          storyPhase={storyPhase}
          bottleneckStationId={bottleneckStationId}
          optimizePressed={optimizePressed}
          dismissible={!autoplayActive}
          onClose={handleCloseFocus}
          onOptimize={
            storyAnalysisEnabled && storyPhase === "bottleneck"
              ? handleOptimizeFactory
              : undefined
          }
        />

        <SafeAnimatePresence mode="sync">
          {storyAnalysisEnabled && !isFocusActive && flowCaptionText && storyPhase !== "optimizing" && (
            <motion.div
              key={`${storyPhase}-${flowCaptionText.detail}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="ffs-presence-wrap factory-website-flow-ui pointer-events-auto"
            >
              <FactoryFlowStoryCard
                phase={storyPhase}
                label={flowCaptionText.label}
                detail={flowCaptionText.detail}
              />
            </motion.div>
          )}
        </SafeAnimatePresence>

        <div className="factory-story-stack factory-website-flow-ui pointer-events-none absolute inset-x-0 z-[25] flex flex-col items-center">
          <FactoryStoryActions
            storyPhase={storyPhase}
            visible={storyAnalysisEnabled && !isFocusActive}
            pressed={identifyPressed}
          />

          <SafeAnimatePresence mode="sync">
            {storyAnalysisEnabled && !isFocusActive && hintText && (
              <motion.div
                key={hintText}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="factory-machine-hint-wrap"
              >
                <p
                  className={`factory-machine-hint ${
                    storyPhase === "bottleneck" || stationTargeting
                      ? "factory-machine-hint--alert"
                      : ""
                  }`}
                >
                  <span className="factory-machine-hint-dot" aria-hidden />
                  <span className="factory-machine-hint-text">{hintText}</span>
                </p>
              </motion.div>
            )}
          </SafeAnimatePresence>
        </div>
      </div>
    </div>
  );
}
