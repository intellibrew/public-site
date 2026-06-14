"use client";

import { useEffect, useState, useRef, RefObject } from "react";

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let frameId = 0;
    let nextPosition = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      nextPosition = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };

      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        setPosition(nextPosition);
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return position;
}

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isInView };
}

export function useParallax(speed: number = 0.5): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frameId = 0;

    const updateParallax = () => {
      frameId = 0;
      const rect = element.getBoundingClientRect();
      const scrolled = window.scrollY;
      const offset = (rect.top + scrolled - window.innerHeight / 2) * speed * 0.1;
      element.style.transform = `translateY(${offset}px)`;
    };
    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateParallax);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateParallax();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed]);

  return ref;
}

export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let lastProgress = -1;

    const updateProgress = () => {
      frameId = 0;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const nextProgress = scrollHeight > 0 ? scrolled / scrollHeight : 0;
      if (Math.abs(nextProgress - lastProgress) < 0.001) return;
      lastProgress = nextProgress;
      setProgress(nextProgress);
    };
    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return progress;
}
