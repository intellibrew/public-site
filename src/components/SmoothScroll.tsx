"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

interface SmoothScrollProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.2,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.6,
      touchMultiplier: 1.2,
      syncTouch: false, // Keep false for stability on older iOS
      infinite: false,
      autoRaf: true, // Use Lenis's internal RAF for consistent timing
    });

    lenisRef.current = lenis;

    // On load, clear hash so refresh doesn’t keep #section and scroll to top
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      requestAnimationFrame(() => {
        lenis.scrollTo(0, { immediate: true });
      });
    }

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const targetElement = document.querySelector(href);
          if (targetElement) {
            lenis.scrollTo(targetElement as HTMLElement, {
              offset: -80,
              duration: 0.75,
              lerp: 0.22,
            });
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    window.lenis = lenis;

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
