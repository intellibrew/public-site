"use client";

import Lenis, { type VirtualScrollData } from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { isPhoneViewport } from "@/lib/layoutBreakpoints";

const COARSE_WHEEL_SCALE = 0.36;
const COARSE_WHEEL_MAX_DELTA = 44;
const COARSE_WHEEL_MIN_DELTA = 18;
const PRECISION_WHEEL_MAX_DELTA = 120;
const LINE_HEIGHT_PX = 16;

function clampDelta(delta: number, max: number) {
  if (delta === 0) return 0;
  return Math.sign(delta) * Math.min(Math.abs(delta), max);
}

function wheelDeltaToPixels(delta: number, deltaMode: number) {
  switch (deltaMode) {
    case WheelEvent.DOM_DELTA_LINE:
      return delta * LINE_HEIGHT_PX;
    case WheelEvent.DOM_DELTA_PAGE:
      return delta * (typeof window !== "undefined" ? window.innerHeight : 800);
    default:
      return delta;
  }
}

function isCoarseWheelEvent(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return true;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return true;

  const dominantDelta = Math.max(Math.abs(event.deltaY), Math.abs(event.deltaX));
  if (dominantDelta === 0) return false;

  // Trackpads emit fractional pixel deltas; mouse wheels emit integer detents.
  const hasFractionalDelta =
    !Number.isInteger(event.deltaY) || !Number.isInteger(event.deltaX);
  if (hasFractionalDelta) return false;

  return dominantDelta >= 48;
}

function softenCoarseWheelDelta(delta: number) {
  if (delta === 0) return 0;
  const sign = Math.sign(delta);
  const softened = Math.abs(delta) * COARSE_WHEEL_SCALE;
  return sign * Math.min(COARSE_WHEEL_MAX_DELTA, Math.max(COARSE_WHEEL_MIN_DELTA, softened));
}

function normalizeVirtualScroll(data: VirtualScrollData) {
  if (!(data.event instanceof WheelEvent)) return true;

  const event = data.event;
  const coarse = isCoarseWheelEvent(event);
  const pixelDeltaX = wheelDeltaToPixels(data.deltaX, event.deltaMode);
  const pixelDeltaY = wheelDeltaToPixels(data.deltaY, event.deltaMode);

  if (coarse) {
    data.deltaX = softenCoarseWheelDelta(pixelDeltaX);
    data.deltaY = softenCoarseWheelDelta(pixelDeltaY);
    return true;
  }

  data.deltaX = clampDelta(pixelDeltaX, PRECISION_WHEEL_MAX_DELTA);
  data.deltaY = clampDelta(pixelDeltaY, PRECISION_WHEEL_MAX_DELTA);
  return true;
}

type ScrollToOptions = {
  duration?: number;
  immediate?: boolean;
  onComplete?: () => void;
};

type LenisContextValue = {
  scrollTo: (target: number, options?: ScrollToOptions) => void;
  getLenis: () => Lenis | null;
  onScroll: (callback: (lenis: Lenis) => void) => () => void;
};

const LenisContext = createContext<LenisContextValue | null>(null);

export function useLenisContext() {
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error("useLenisContext must be used within SmoothScroll");
  }
  return context;
}

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const listenersRef = useRef(new Set<(lenis: Lenis) => void>());

  useEffect(() => {
    const isPhone = isPhoneViewport();
    const lenis = new Lenis({
      autoRaf: true,
      lerp: isPhone ? 0.12 : 0.16,
      smoothWheel: true,
      syncTouch: !isPhone,
      syncTouchLerp: 0.12,
      wheelMultiplier: 1,
      touchMultiplier: 0.95,
      touchInertiaExponent: 1.7,
      virtualScroll: normalizeVirtualScroll,
      prevent: (node) => Boolean(node.closest("[data-lenis-prevent]")),
    });
    lenisRef.current = lenis;
    lenis.scrollTo(0, { immediate: true });

    const onLenisScroll = (instance: Lenis) => {
      listenersRef.current.forEach((listener) => listener(instance));
    };

    lenis.on("scroll", onLenisScroll);

    return () => {
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: number, options?: ScrollToOptions) => {
    lenisRef.current?.scrollTo(target, {
      duration: options?.duration,
      immediate: options?.immediate,
      onComplete: () => options?.onComplete?.(),
    });
  }, []);

  const getLenis = useCallback(() => lenisRef.current, []);

  const onScroll = useCallback((callback: (lenis: Lenis) => void) => {
    listenersRef.current.add(callback);
    return () => listenersRef.current.delete(callback);
  }, []);

  const value = useMemo<LenisContextValue>(
    () => ({
      scrollTo,
      getLenis,
      onScroll,
    }),
    [getLenis, onScroll, scrollTo]
  );

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}
