"use client";

import Lenis from "lenis";
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
      lerp: 0.18,
      smoothWheel: true,
      syncTouch: !isPhone,
      syncTouchLerp: 0.16,
      wheelMultiplier: 0.92,
      touchMultiplier: 1,
      touchInertiaExponent: 22,
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
