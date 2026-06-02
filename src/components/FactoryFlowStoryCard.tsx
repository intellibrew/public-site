"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { StoryPhase } from "@/lib/factory/flowOptimization";

type FactoryFlowStoryCardProps = {
  phase: StoryPhase;
  label: string;
  detail: string;
};

function SplitLabel({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((char, index) => (
        <span key={`${char}-${index}`} className="ffs-char">
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  );
}

function DetailWithCounters({ text, phase }: { text: string; phase: StoryPhase }) {
  const parts = text.split(/(\d+)/);

  return (
    <>
      {parts.map((part, index) =>
        /^\d+$/.test(part) ? (
          <span
            key={`n-${index}`}
            className="ffs-counter"
            data-value={part}
            data-phase={phase}
          >
            {phase === "optimized" ? "0" : part}
          </span>
        ) : (
          <span key={`t-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

export default function FactoryFlowStoryCard({
  phase,
  label,
  detail,
}: FactoryFlowStoryCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const detailRef = useRef<HTMLParagraphElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const borderLength = borderRef.current?.getTotalLength() ?? 720;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        root,
        { clipPath: "inset(0 100% 0 0 round 2px)", opacity: 0, x: -18 },
        { clipPath: "inset(0 0% 0 0 round 2px)", opacity: 1, x: 0, duration: 0.62 },
        0
      );

      if (borderRef.current) {
        gsap.set(borderRef.current, {
          strokeDasharray: borderLength,
          strokeDashoffset: borderLength,
        });
        tl.to(
          borderRef.current,
          { strokeDashoffset: 0, duration: 0.95, ease: "power2.inOut" },
          0.08
        );
      }

      const chars = labelRef.current?.querySelectorAll(".ffs-char");
      if (chars?.length) {
        tl.fromTo(
          chars,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            stagger: { each: 0.022, from: "start" },
          },
          0.32
        );
      }

      if (detailRef.current) {
        tl.fromTo(
          detailRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.42 },
          0.52
        );
      }

      if (scanRef.current) {
        tl.fromTo(
          scanRef.current,
          { yPercent: -120, opacity: 0.85 },
          { yPercent: 220, opacity: 0, duration: 0.75, ease: "power1.in" },
          0.12
        );
      }

      if (phase === "optimized") {
        const flash = root.querySelector(".ffs-flash");
        if (flash) {
          tl.fromTo(
            flash,
            { opacity: 0.55 },
            { opacity: 0, duration: 0.7, ease: "power2.out" },
            0.55
          );
        }

        root.querySelectorAll<HTMLElement>(".ffs-counter").forEach((counter) => {
          const target = Number(counter.dataset.value ?? 0);
          const counterState = { value: 0 };
          tl.to(
            counterState,
            {
              value: target,
              duration: 1.05,
              ease: "power2.out",
              snap: { value: 1 },
              onUpdate: () => {
                counter.textContent = String(Math.round(counterState.value));
              },
            },
            0.58
          );
        });
      }
    }, root);

    return () => ctx.revert();
  }, [label, detail, phase]);

  return (
    <div
      ref={rootRef}
      className={`ffs-card ffs-card--${phase}`}
      role="status"
      aria-live="polite"
    >
      <svg className="ffs-border-svg" aria-hidden viewBox="0 0 320 88" preserveAspectRatio="none">
        <rect
          ref={borderRef}
          x="1"
          y="1"
          width="318"
          height="86"
          rx="2"
          ry="2"
          fill="none"
          className="ffs-border-stroke"
        />
      </svg>

      <div ref={scanRef} className="ffs-scan" aria-hidden />
      <div className="ffs-flash" aria-hidden />

      <div className="ffs-accent-bar" aria-hidden />

      <div className="ffs-body">
        <p ref={labelRef} className="ffs-label">
            <span className="ffs-prefix" aria-hidden>
              {"//"}
            </span>
            <SplitLabel text={label} />
          </p>
        <p ref={detailRef} className="ffs-detail">
          <DetailWithCounters text={detail} phase={phase} />
        </p>
      </div>

      <span className="ffs-seq" aria-hidden>
        {phase.slice(0, 3).toUpperCase()}
      </span>
    </div>
  );
}
