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
import { MACHINE_MAP } from "@/lib/factory/machineRegistry";
import {
  advanceStorySnapshot,
  computeFlowState,
  computeConveyorPanelMetrics,
  flowCaption,
  initialStorySnapshot,
  OPTIMIZING_DURATION_MS,
  pickRandomBottleneckStationId,
  type StoryPhase,
  type StorySnapshot,
} from "@/lib/factory/flowOptimization";

const SafeAnimatePresence = AnimatePresence as FC<
  PropsWithChildren<{ mode?: "wait" | "sync" | "popLayout" }>
>;

type FactoryBuildExperienceProps = {
  getBuildProgress: () => number;
  getStoryEnabled: () => boolean;
  storyEnabled?: boolean;
  simplified?: boolean;
};

export default function FactoryBuildExperience({
  getBuildProgress,
  getStoryEnabled,
  storyEnabled = false,
  simplified = false,
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

  const focusRequestRef = useRef<
    ((id: string | null, options?: { immediate?: boolean }) => void) | null
  >(null);
  const storyRef = useRef<StorySnapshot>(
    initialStorySnapshot(performance.now(), bottleneckStationId)
  );
  const isFocusActive = focusPhase !== "idle";
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
    storyRef.current = advanceStorySnapshot(storyRef.current, "bottleneck");
    setStoryPhase("bottleneck");
  }, []);

  useEffect(() => {
    if (!storyAnalysisEnabled) return;
    storyRef.current = initialStorySnapshot(performance.now(), bottleneckStationId);
    setStoryPhase("underproduction");
    setFlowCaptionText(null);
  }, [storyAnalysisEnabled, bottleneckStationId]);

  useEffect(() => {
    if (!storyAnalysisEnabled) return;
    if (storyPhase !== "optimizing") return;
    const optimizedTimer = window.setTimeout(() => {
      storyRef.current = advanceStorySnapshot(storyRef.current, "optimized");
      setStoryPhase("optimized");
    }, OPTIMIZING_DURATION_MS);
    return () => window.clearTimeout(optimizedTimer);
  }, [storyAnalysisEnabled, storyPhase]);

  useEffect(() => {
    if (!storyAnalysisEnabled) return;

    let frameId = 0;
    let lastPhase = storyRef.current.phase;
    let lastCaptionKey = "";

    const tick = () => {
      const now = performance.now();
      const flow = computeFlowState(storyRef.current, now);
      const phase = storyRef.current.phase;

      if (phase !== lastPhase) {
        lastPhase = phase;
        setStoryPhase(phase);
      }

      const caption = flowCaption(flow, storyRef.current);
      const captionKey = caption ? `${caption.label}|${caption.detail}` : "";
      if (captionKey !== lastCaptionKey) {
        lastCaptionKey = captionKey;
        setFlowCaptionText(caption);
      }

      computeConveyorPanelMetrics(flow);

      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [storyAnalysisEnabled]);

  const hintText = (() => {
    if (isFocusActive) return null;
    if (storyPhase === "bottleneck") {
      return hoveredStation === bottleneckStationId
        ? "Open bottleneck report"
        : `Click the stalled ${constraintName} station`;
    }
    if (storyPhase === "optimizing") return "Optimising factory flow…";
    if (storyPhase === "optimized") {
      return hoveredStation
        ? `Inspect · ${MACHINE_MAP.get(hoveredStation)?.name ?? hoveredStation}`
        : "Full production flow - click any machine to inspect";
    }
    return "Press Identify bottlenecks to scan the line for constraints";
  })();

  return (
    <div
      className={`relative h-full min-h-[100svh] w-full overflow-hidden bg-[#050708] ${isFocusActive ? "factory-focus-active" : ""}`}
    >
      <div aria-hidden className="factory-scene-backdrop pointer-events-none absolute inset-0 z-0" />
      <div aria-hidden className="factory-ambient-light factory-ambient-light--teal pointer-events-none absolute inset-0 z-[1]" />

      <div className="factory-stage pointer-events-auto relative z-10 h-full w-full overflow-hidden">
        <FactoryThreeScene
          getBuildProgress={getBuildProgress}
          getStoryActive={getStoryEnabled}
          storyRef={storyRef}
          onFocusChange={handleFocusChange}
          onStationHover={handleStationHover}
          focusRequestRef={focusRequestRef}
          simplified={simplified}
        />

        <MachineHologramOverlay
          stationId={focusedStation}
          visible={isFocusActive}
          variant={isBottleneckAlert ? "bottleneck" : "inspect"}
          showBottleneckAnalysis
          onClose={handleCloseFocus}
          onOptimize={
            storyAnalysisEnabled && storyPhase === "bottleneck"
              ? handleOptimizeFactory
              : undefined
          }
        />

        <SafeAnimatePresence mode="wait">
          {storyAnalysisEnabled && !isFocusActive && flowCaptionText && storyPhase !== "optimizing" && (
            <motion.div
              key={`${storyPhase}-${flowCaptionText.detail}`}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, x: -10, transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
              className="ffs-presence-wrap"
            >
              <FactoryFlowStoryCard
                phase={storyPhase}
                label={flowCaptionText.label}
                detail={flowCaptionText.detail}
              />
            </motion.div>
          )}
        </SafeAnimatePresence>

        <div className="factory-story-stack pointer-events-none absolute inset-x-0 bottom-4 z-[25] flex flex-col items-center gap-2 px-4">
          <FactoryStoryActions
            storyPhase={storyPhase}
            visible={storyAnalysisEnabled && !isFocusActive}
            onIdentifyBottlenecks={handleIdentifyBottlenecks}
          />

          <SafeAnimatePresence mode="wait">
            {storyAnalysisEnabled && !isFocusActive && hintText && (
              <motion.div
                key={hintText}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ delay: 0.25, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className={`factory-machine-hint ${storyPhase === "bottleneck" ? "factory-machine-hint--alert" : ""}`}
              >
                <span className="factory-machine-hint-dot" />
                {hintText}
              </motion.div>
            )}
          </SafeAnimatePresence>
        </div>
      </div>
    </div>
  );
}
