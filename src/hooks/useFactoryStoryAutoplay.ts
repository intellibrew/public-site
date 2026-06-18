"use client";

import { useEffect, useRef, useState } from "react";

const TIMING = {
  identifyDelay: 1000,
  identifyPress: 280,
  bottleneckSettle: 2400,
  stationTarget: 420,
  cardRead: 3000,
  optimizePress: 320,
} as const;

const IDENTIFY_AT = TIMING.identifyDelay;
const IDENTIFY_FIRE_AT = IDENTIFY_AT + TIMING.identifyPress;
const STATION_TARGET_AT = IDENTIFY_FIRE_AT + TIMING.bottleneckSettle;
const STATION_FOCUS_AT = STATION_TARGET_AT + TIMING.stationTarget;
const OPTIMIZE_PRESS_AT = STATION_FOCUS_AT + TIMING.cardRead;
const OPTIMIZE_FIRE_AT = OPTIMIZE_PRESS_AT + TIMING.optimizePress;

type UseFactoryStoryAutoplayOptions = {
  enabled: boolean;
  scenePaused: boolean;
  bottleneckStationId: string;
  focusRequestRef: React.MutableRefObject<
    ((id: string | null, options?: { immediate?: boolean }) => void) | null
  >;
  onIdentifyBottlenecks: () => void;
  onOptimizeFactory: () => void;
};

export function useFactoryStoryAutoplay({
  enabled,
  scenePaused,
  bottleneckStationId,
  focusRequestRef,
  onIdentifyBottlenecks,
  onOptimizeFactory,
}: UseFactoryStoryAutoplayOptions) {
  const [identifyPressed, setIdentifyPressed] = useState(false);
  const [optimizePressed, setOptimizePressed] = useState(false);
  const [stationTargeting, setStationTargeting] = useState(false);
  const [autoplayActive, setAutoplayActive] = useState(false);

  const handlersRef = useRef({ onIdentifyBottlenecks, onOptimizeFactory });
  const scenePausedRef = useRef(scenePaused);
  const hasRunRef = useRef(false);
  handlersRef.current = { onIdentifyBottlenecks, onOptimizeFactory };
  scenePausedRef.current = scenePaused;

  useEffect(() => {
    if (!enabled || hasRunRef.current) return;

    const fired = {
      identifyPress: false,
      identify: false,
      stationTarget: false,
      stationFocus: false,
      optimizePress: false,
      optimize: false,
    };

    const timelineStart = performance.now();
    let pausedAt: number | null = scenePausedRef.current ? performance.now() : null;
    let pausedTotal = 0;
    let raf = 0;

    setAutoplayActive(true);

    const elapsed = () => performance.now() - timelineStart - pausedTotal;

    const run = () => {
      const paused = scenePausedRef.current;
      if (paused) {
        if (pausedAt === null) pausedAt = performance.now();
        raf = requestAnimationFrame(run);
        return;
      }

      if (pausedAt !== null) {
        pausedTotal += performance.now() - pausedAt;
        pausedAt = null;
      }

      const t = elapsed();

      if (!fired.identifyPress && t >= IDENTIFY_AT) {
        fired.identifyPress = true;
        setIdentifyPressed(true);
      }

      if (!fired.identify && t >= IDENTIFY_FIRE_AT) {
        fired.identify = true;
        setIdentifyPressed(false);
        handlersRef.current.onIdentifyBottlenecks();
      }

      if (!fired.stationTarget && t >= STATION_TARGET_AT) {
        fired.stationTarget = true;
        setStationTargeting(true);
      }

      if (!fired.stationFocus && t >= STATION_FOCUS_AT) {
        fired.stationFocus = true;
        setStationTargeting(false);
        focusRequestRef.current?.(bottleneckStationId);
      }

      if (!fired.optimizePress && t >= OPTIMIZE_PRESS_AT) {
        fired.optimizePress = true;
        setOptimizePressed(true);
      }

      if (!fired.optimize && t >= OPTIMIZE_FIRE_AT) {
        fired.optimize = true;
        setOptimizePressed(false);
        handlersRef.current.onOptimizeFactory();
        setAutoplayActive(false);
        hasRunRef.current = true;
        return;
      }

      raf = requestAnimationFrame(run);
    };

    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [enabled, bottleneckStationId, focusRequestRef]);

  return {
    identifyPressed,
    optimizePressed,
    stationTargeting,
    autoplayActive,
  };
}
