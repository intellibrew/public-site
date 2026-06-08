"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FC, PropsWithChildren } from "react";
import type { StoryPhase } from "@/lib/factory/flowOptimization";
import { isPhoneViewport } from "@/lib/layoutBreakpoints";

const SafeAnimatePresence = AnimatePresence as FC<
  PropsWithChildren<{ mode?: "wait" | "sync" | "popLayout" }>
>;

type FactoryStoryActionsProps = {
  storyPhase: StoryPhase;
  visible: boolean;
  onIdentifyBottlenecks: () => void;
};

export default function FactoryStoryActions({
  storyPhase,
  visible,
  onIdentifyBottlenecks,
}: FactoryStoryActionsProps) {
  const showIdentify = visible && storyPhase === "underproduction";
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const check = () => setIsPhone(isPhoneViewport());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const identifyHint = isPhone
    ? "Press Identify bottlenecks to scan"
    : "Press Identify bottlenecks to scan the line for constraints";

  return (
    <div className="factory-story-actions pointer-events-none flex justify-center">
      <SafeAnimatePresence mode="sync">
        {showIdentify ? (
          <motion.div
            key="identify"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="factory-story-identify-group pointer-events-auto flex w-fit max-w-full flex-col items-center text-center"
          >
            <button
              type="button"
              onClick={onIdentifyBottlenecks}
              className="factory-story-cta factory-story-cta--identify"
            >
              <span className="factory-story-cta-label">Identify bottlenecks</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M8 2v4M8 10v4M2 8h4M10 8h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <p className="factory-machine-hint factory-machine-hint--cta">
              <span className="factory-machine-hint-dot" aria-hidden />
              <span className="factory-machine-hint-text">{identifyHint}</span>
            </p>
          </motion.div>
        ) : null}
      </SafeAnimatePresence>
    </div>
  );
}
