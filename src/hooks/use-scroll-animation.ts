import { useEffect, useRef, useState } from "react";


export function useCountUp(target: number, durationMs = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!ref.current || hasStarted.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const start = performance.now();

          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / durationMs);
            const next = Math.round(target * progress);
            setCount(next);
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };

          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, durationMs]);

  return { count, ref };
}

