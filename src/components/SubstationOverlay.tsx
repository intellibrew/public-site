"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { FC, PropsWithChildren } from "react";
import {
  POWER_SUBSTATION_INFO,
  type SubstationMetric,
} from "@/lib/factory/powerSubstation";
import type { StoryPhase } from "@/lib/factory/flowOptimization";

const SafeAnimatePresence = AnimatePresence as FC<
  PropsWithChildren<{ mode?: "wait" | "sync" | "popLayout" }>
>;

type SubstationOverlayProps = {
  visible: boolean;
  storyPhase?: StoryPhase;
  onClose: () => void;
};

function projectSubstationMetrics(
  metrics: SubstationMetric[],
  storyPhase: StoryPhase | undefined
): SubstationMetric[] {
  return metrics.map((metric) => {
    if (metric.label === "Bus load") {
      if (storyPhase === "bottleneck") return { ...metric, value: 89 };
      if (storyPhase === "optimizing") return { ...metric, value: 76 };
      if (storyPhase === "optimized") return { ...metric, value: 58 };
      return { ...metric, value: 71 };
    }
    if (metric.label === "Line demand") {
      if (storyPhase === "bottleneck") return { ...metric, value: 2280 };
      if (storyPhase === "optimizing") return { ...metric, value: 1960 };
      if (storyPhase === "optimized") return { ...metric, value: 1520 };
      return { ...metric, value: 1840 };
    }
    if (metric.label === "Power factor") {
      if (storyPhase === "bottleneck") return { ...metric, value: 0.86 };
      if (storyPhase === "optimized") return { ...metric, value: 0.97 };
      return { ...metric, value: 0.92 };
    }
    return metric;
  });
}

function MetricRow({ metric }: { metric: SubstationMetric }) {
  const pct = (metric.value / metric.max) * 100;
  const decimals = metric.unit === "PF" ? 2 : metric.unit === "%" ? 0 : 0;
  const displayValue =
    decimals > 0 ? metric.value.toFixed(decimals) : String(Math.round(metric.value));

  return (
    <div className="holo-metric-row">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <span className="min-w-0 truncate pr-2 text-[10px] uppercase tracking-[0.16em] text-teal-300/55">
          {metric.label}
        </span>
        <span className="holo-metric-value shrink-0 font-orbitron text-[13px] tabular-nums text-teal-100">
          <span className="holo-metric-num" data-value={metric.value} data-decimals={decimals}>
            {displayValue}
          </span>
          {metric.unit && metric.unit !== "PF" && (
            <span className="holo-metric-unit ml-0.5 text-[9px] font-normal text-teal-400/60">
              {metric.unit}
            </span>
          )}
        </span>
      </div>
      <div className="holo-metric-track">
        <div className="holo-metric-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SubstationOverlay({
  visible,
  storyPhase,
  onClose,
}: SubstationOverlayProps) {
  const info = POWER_SUBSTATION_INFO;
  const metrics = projectSubstationMetrics(info.metrics, storyPhase);

  if (typeof document === "undefined") return null;

  return createPortal(
    <SafeAnimatePresence mode="sync">
      {visible && (
        <motion.div
          key="substation-overlay"
          className="holo-overlay holo-overlay--instant pointer-events-auto fixed inset-0 z-[40] flex items-start justify-center md:items-center"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0 }}
        >
          <button
            type="button"
            className="holo-backdrop absolute inset-0"
            aria-label="Close substation panel"
            onPointerDown={onClose}
            onClick={onClose}
          />
          <div className="holo-vignette pointer-events-none absolute inset-0" aria-hidden />
          <div className="holo-grid pointer-events-none absolute inset-0" aria-hidden />

          <div
              className="holo-tablet holo-tablet--compact relative z-[3] flex w-full flex-col"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="holo-tablet-chrome" aria-hidden>
                <svg className="holo-border-svg" viewBox="0 0 520 640" preserveAspectRatio="none">
                  <rect
                    className="holo-border-stroke"
                    x="1"
                    y="1"
                    width="518"
                    height="638"
                    rx="3"
                    ry="3"
                    fill="none"
                  />
                </svg>
                <div className="holo-accent-bar" />
              </div>

              <div className="holo-tablet-body holo-tablet-body--responsive flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-5 pt-4 md:px-5 md:pt-5">
                <header className="relative shrink-0">
                  <button
                    type="button"
                    onPointerDown={onClose}
                    onClick={onClose}
                    className="holo-dismiss absolute right-0 top-0 z-20"
                    aria-label="Close substation detail view"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path
                        d="M1 1l12 12M13 1L1 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  <div className="holo-lock pr-10">
                    <span className="holo-lock-text">
                      <span className="holo-lock-label">
                        <span className="holo-prefix" aria-hidden>
                          {"//"}
                        </span>
                        Distribution panel
                      </span>
                      <span className="holo-lock-id">{info.codename}</span>
                    </span>
                  </div>
                </header>

                <div className="holo-tablet-scroll holo-tablet-scroll--inspect holo-tablet-scroll--substation mt-4 min-h-0 flex-1 space-y-3 pr-1">
                  <div className="holo-glass-pane p-4">
                    <p className="font-orbitron text-lg text-teal-50">{info.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-teal-300/55">
                      {info.tagline}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-teal-100/75">{info.description}</p>
                  </div>

                  <div className="holo-glass-pane p-4">
                    <p className="holo-pane-title">Electrical properties</p>
                    <ul className="mt-2 space-y-2">
                      {info.specs.map((spec) => (
                        <li key={spec.label} className="holo-spec-row">
                          <span>{spec.label}</span>
                          <span>{spec.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="holo-glass-pane p-4">
                    <p className="holo-pane-title">Live telemetry</p>
                    <div className="mt-3 space-y-3">
                      {metrics.map((metric) => (
                        <MetricRow key={metric.label} metric={metric} />
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="holo-data-chip">
                        <span className="holo-data-chip-label">Feeder status</span>
                        <span className="holo-data-chip-value">8 / 8 online</span>
                      </div>
                      <div className="holo-data-chip">
                        <span className="holo-data-chip-label">Ground fault</span>
                        <span className="holo-data-chip-value">None detected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </motion.div>
      )}
    </SafeAnimatePresence>,
    document.body
  );
}
