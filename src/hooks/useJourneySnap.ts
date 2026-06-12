"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import type Lenis from "lenis";
import { useLenis } from "@/hooks/useLenis";
import {
  progressToScrollY,
  resolveSnapProgress,
  scrollYToProgress,
  SNAP_DURATION_S,
  SNAP_IDLE_MS,
  SNAP_MIN_DELTA,
} from "@/lib/factory/scrollJourney";

type UseJourneySnapOptions = {
  journeyRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

export function useJourneySnap({ journeyRef, enabled = true }: UseJourneySnapOptions) {
  const { scrollTo, onScroll } = useLenis();
  const directionRef = useRef<0 | 1 | -1>(0);
  const isSnappingRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUserScrolledRef = useRef(false);

  const animateToProgress = useCallback(
    (progress: number, duration = SNAP_DURATION_S) => {
      const journeyEl = journeyRef.current;
      if (!journeyEl) return;

      const targetY = progressToScrollY(progress, journeyEl.offsetHeight, window.innerHeight);
      isSnappingRef.current = true;
      scrollTo(targetY, {
        duration,
        onComplete: () => {
          isSnappingRef.current = false;
        },
      });
    },
    [journeyRef, scrollTo]
  );

  const scrollToProgress = useCallback(
    (progress: number, duration = SNAP_DURATION_S) => {
      animateToProgress(progress, duration);
    },
    [animateToProgress]
  );

  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const runSnap = (lenis: Lenis) => {
      if (isSnappingRef.current || !hasUserScrolledRef.current) return;

      const journeyEl = journeyRef.current;
      if (!journeyEl) return;

      const progress = scrollYToProgress(lenis.scroll, journeyEl.offsetHeight, window.innerHeight);
      const targetProgress = resolveSnapProgress(progress, directionRef.current);
      if (targetProgress == null) return;

      const delta = Math.abs(targetProgress - progress);
      if (delta < SNAP_MIN_DELTA) return;

      const targetY = progressToScrollY(targetProgress, journeyEl.offsetHeight, window.innerHeight);
      if (Math.abs(targetY - lenis.scroll) < 1) return;

      animateToProgress(targetProgress);
    };

    const scheduleSnap = (lenis: Lenis) => {
      if (!hasUserScrolledRef.current) return;

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (Math.abs(lenis.velocity) > 0.02) {
          scheduleSnap(lenis);
          return;
        }
        runSnap(lenis);
      }, SNAP_IDLE_MS);
    };

    const unsubscribe = onScroll((lenis) => {
      if (isSnappingRef.current) return;
      directionRef.current = lenis.direction;
      scheduleSnap(lenis);
    });

    return () => {
      unsubscribe();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [enabled, journeyRef, onScroll, animateToProgress]);

  return { scrollToProgress };
}
