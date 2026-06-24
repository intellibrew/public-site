"use client";

import type { CSSProperties, ReactNode } from "react";

type NarrativeRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function NarrativeReveal({ children, delay = 0, className = "" }: NarrativeRevealProps) {
  return (
    <div
      className={`factory-narrative-reveal ${className}`.trim()}
      style={{ "--d": delay } as CSSProperties}
    >
      {children}
    </div>
  );
}
