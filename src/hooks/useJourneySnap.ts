"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import type Lenis from "lenis";
import { useLenis } from "@/hooks/useLenis";
import {
  isInTransitionBand,
  JOURNEY_SNAPS,
  progressToScrollY,
  resolveSnapProgress,
  scrollYToProgress,
  shouldCommitTransition,
  shouldDisableJourneySnap,
  SNAP_DURATION_S,
  SNAP_IDLE_MS,
  SNAP_IDLE_MS_AGGRESSIVE,
  SNAP_MIN_DELTA,
  SNAP_VELOCITY_COMMIT,
  SNAP_VELOCITY_IDLE,
} from "@/lib/factory/scrollJourney";

type UseJourneySnapOptions = {
  journeyRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  aggressive?: boolean;
};

export function useJourneySnap({
  journeyRef,
  enabled = true,
  aggressive = false,
}: UseJourneySnapOptions) {
  const { scrollTo, getLenis, onScroll } = useLenis();
  const directionRef = useRef<0 | 1 | -1>(0);
  const isSnappingRef = useRef(false);
  const snapRunRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUserScrolledRef = useRef(false);
  const idleMs = aggressive ? SNAP_IDLE_MS_AGGRESSIVE : SNAP_IDLE_MS;

  const clearIdleTimer = useCallback(() => {
    if (!idleTimerRef.current) return;
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const cancelSnap = useCallback(() => {
    if (!isSnappingRef.current) return;

    const lenis = getLenis();
    snapRunRef.current += 1;
    isSnappingRef.current = false;
    clearIdleTimer();

    if (lenis) {
      scrollTo(lenis.scroll, { immediate: true });
    }
  }, [clearIdleTimer, getLenis, scrollTo]);

  const animateToProgress = useCallback(
    (progress: number, duration = SNAP_DURATION_S) => {
      const journeyEl = journeyRef.current;
      if (!journeyEl) return;

      const targetY = progressToScrollY(progress, journeyEl.offsetHeight, window.innerHeight);
      const snapRun = snapRunRef.current + 1;
      snapRunRef.current = snapRun;
      isSnappingRef.current = true;
      const snapToHero = progress === JOURNEY_SNAPS[0].progress;
      scrollTo(targetY, {
        duration: snapToHero ? 0 : duration,
        immediate: snapToHero,
        onComplete: () => {
          if (snapRunRef.current !== snapRun) return;
          isSnappingRef.current = false;
        },
      });
    },
    [journeyRef, scrollTo]
  );

  const scrollToProgress = useCallback(
    (progress: number, duration = SNAP_DURATION_S) => {
      if (isSnappingRef.current) return;
      animateToProgress(progress, duration);
    },
    [animateToProgress]
  );

  const trySnap = useCallback(
    (lenis: Lenis, direction: 0 | 1 | -1) => {
      if (isSnappingRef.current || !hasUserScrolledRef.current) return false;

      const journeyEl = journeyRef.current;
      if (!journeyEl) return false;

      const progress = scrollYToProgress(lenis.scroll, journeyEl.offsetHeight, window.innerHeight);
      if (shouldDisableJourneySnap(progress)) return false;

      const targetProgress = resolveSnapProgress(progress, direction);
      if (targetProgress == null) return false;

      const delta = Math.abs(targetProgress - progress);
      if (delta < SNAP_MIN_DELTA) return false;

      animateToProgress(targetProgress);
      return true;
    },
    [animateToProgress, journeyRef]
  );

  useEffect(() => {
    if (!enabled) return;

    const markUserScroll = (event: Event) => {
      if (
        event instanceof KeyboardEvent &&
        ![
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      ) {
        return;
      }

      hasUserScrolledRef.current = true;
      cancelSnap();
    };

    window.addEventListener("wheel", markUserScroll, { passive: true });
    window.addEventListener("touchstart", markUserScroll, { passive: true });
    window.addEventListener("touchmove", markUserScroll, { passive: true });
    window.addEventListener("keydown", markUserScroll);

    return () => {
      window.removeEventListener("wheel", markUserScroll);
      window.removeEventListener("touchstart", markUserScroll);
      window.removeEventListener("touchmove", markUserScroll);
      window.removeEventListener("keydown", markUserScroll);
    };
  }, [cancelSnap, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const scheduleSnap = (lenis: Lenis) => {
      if (!hasUserScrolledRef.current) return;

      const journeyEl = journeyRef.current;
      if (journeyEl) {
        const progress = scrollYToProgress(
          lenis.scroll,
          journeyEl.offsetHeight,
          window.innerHeight
        );
        if (shouldDisableJourneySnap(progress)) return;
      }

      clearIdleTimer();
      idleTimerRef.current = setTimeout(() => {
        if (Math.abs(lenis.velocity) > SNAP_VELOCITY_IDLE) {
          scheduleSnap(lenis);
          return;
        }
        trySnap(lenis, directionRef.current);
      }, idleMs);
    };

    const unsubscribe = onScroll((lenis) => {
      if (isSnappingRef.current) return;

      const journeyEl = journeyRef.current;
      if (journeyEl && hasUserScrolledRef.current) {
        const progress = scrollYToProgress(
          lenis.scroll,
          journeyEl.offsetHeight,
          window.innerHeight
        );
        const snapDirection = lenis.direction || directionRef.current;
        const canSnap = !shouldDisableJourneySnap(progress);
        const lowVelocity = Math.abs(lenis.velocity) < SNAP_VELOCITY_COMMIT;

        if (canSnap && lowVelocity && snapDirection !== 0) {
          if (shouldCommitTransition(progress, snapDirection) && trySnap(lenis, snapDirection)) {
            return;
          }
        }

        if (canSnap && lowVelocity && isInTransitionBand(progress)) {
          if (trySnap(lenis, snapDirection)) return;
        }
      }

      if (lenis.direction !== 0) {
        directionRef.current = lenis.direction;
      }
      scheduleSnap(lenis);
    });

    return () => {
      unsubscribe();
      clearIdleTimer();
    };
  }, [clearIdleTimer, enabled, idleMs, journeyRef, onScroll, trySnap]);

  return { scrollToProgress, isSnappingRef };
}
