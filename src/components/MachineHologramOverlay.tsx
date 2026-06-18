"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { FC, PropsWithChildren } from "react";
import {
  MACHINE_DEFINITIONS,
  MACHINE_MAP,
  type MachineMetric,
  type MachineDefinition,
} from "@/lib/factory/machineRegistry";
import MachinePreviewViewport from "@/components/MachinePreviewViewport";
import type { StoryPhase } from "@/lib/factory/flowOptimization";

const SafeAnimatePresence = AnimatePresence as FC<
  PropsWithChildren<{ mode?: "wait" | "sync" | "popLayout" }>
>;

type MachineHologramOverlayProps = {
  stationId: string | null;
  visible: boolean;
  variant?: "inspect" | "bottleneck";
  showBottleneckAnalysis?: boolean;
  storyPhase?: StoryPhase;
  bottleneckStationId?: string | null;
  optimizePressed?: boolean;
  dismissible?: boolean;
  onClose: () => void;
  onOptimize?: () => void;
};

function stationIndex(id: string) {
  return MACHINE_DEFINITIONS.findIndex((m) => m.id === id) + 1;
}

type MetricProfile = "underproduction" | "bottleneck" | "optimizing" | "optimized";

const LOWER_IS_BETTER = [
  "queue",
  "temperature",
  "load",
  "hit count",
  "jams",
  "spatter",
  "humidity",
  "defect",
  "false reject",
  "rework",
];

function isLowerBetterMetric(metric: MachineMetric) {
  const label = metric.label.toLowerCase();
  return metric.unit === "°C" || LOWER_IS_BETTER.some((term) => label.includes(term));
}

function clampMetric(metric: MachineMetric, value: number) {
  return Math.max(0, Math.min(metric.max, value));
}

function projectedMetricValue(
  metric: MachineMetric,
  profile: MetricProfile,
  isConstraintStation: boolean
) {
  const lowerIsBetter = isLowerBetterMetric(metric);

  if (profile === "optimized") {
    if (lowerIsBetter) {
      return clampMetric(metric, metric.value * 0.62);
    }
    const lift = metric.unit === "%" ? 0.55 : 0.38;
    return clampMetric(metric, metric.value + (metric.max - metric.value) * lift);
  }

  if (profile === "bottleneck") {
    if (lowerIsBetter) {
      return clampMetric(metric, metric.value * (isConstraintStation ? 1.35 : 1.12));
    }
    if (metric.unit === "%") {
      return clampMetric(metric, metric.value * (isConstraintStation ? 0.92 : 0.97));
    }
    return clampMetric(metric, metric.value * (isConstraintStation ? 0.72 : 0.88));
  }

  if (lowerIsBetter) {
    return clampMetric(metric, metric.value * 1.12);
  }
  if (metric.unit === "%") {
    return clampMetric(metric, metric.value * 0.98);
  }
  return clampMetric(metric, metric.value * 0.82);
}

function projectMetrics(
  metrics: MachineMetric[],
  profile: MetricProfile,
  isConstraintStation: boolean
): MachineMetric[] {
  return metrics.map((metric) => ({
    ...metric,
    value: projectedMetricValue(metric, profile, isConstraintStation),
  }));
}

function metricProfileForStory(
  storyPhase: StoryPhase | undefined,
  isBottleneckView: boolean
): MetricProfile {
  if (isBottleneckView) return "bottleneck";
  if (storyPhase === "optimized") return "optimized";
  if (storyPhase === "optimizing") return "optimizing";
  return "underproduction";
}

function lineOutputForProfile(profile: MetricProfile) {
  if (profile === "optimized") return 96;
  if (profile === "optimizing") return 78;
  if (profile === "bottleneck") return 48;
  return 62;
}

function MetricRow({ metric }: { metric: MachineMetric }) {
  const pct = (metric.value / metric.max) * 100;
  const decimals = metric.unit === "%" || metric.unit === "s" ? 1 : 0;
  const displayValue = decimals > 0 ? metric.value.toFixed(decimals) : String(Math.round(metric.value));

  return (
    <div className="holo-metric-row">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <span className="min-w-0 truncate pr-2 text-[10px] uppercase tracking-[0.16em] text-teal-300/55">
          {metric.label}
        </span>
        <span
          className="holo-metric-value shrink-0 font-orbitron text-[13px] tabular-nums text-teal-100"
        >
          <span
            className="holo-metric-num"
            data-value={metric.value}
            data-decimals={decimals}
          >
            {displayValue}
          </span>
          {metric.unit && (
            <span className="holo-metric-unit ml-0.5 text-[9px] font-normal text-teal-400/60">
              {metric.unit}
            </span>
          )}
        </span>
      </div>
      <div className="holo-metric-track">
        <div className="holo-metric-fill" data-width={`${pct}%`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function HoloPane({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`holo-glass-pane ${className}`}>
      {children}
    </div>
  );
}

function DataChip({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`holo-data-chip ${className}`}>
      <span className="holo-data-chip-label">{label}</span>
      <span className="holo-data-chip-value">{value}</span>
    </div>
  );
}

function LineFlow({
  upstream,
  current,
  downstream,
}: {
  upstream: string;
  current: string;
  downstream: string;
}) {
  return (
    <div className="holo-line-flow">
      <span className="holo-flow-node holo-flow-node--dim">{upstream}</span>
      <span className="holo-flow-arrow" aria-hidden>
        <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
          <path d="M0 4h16M13 1l4 3-4 3" stroke="currentColor" strokeWidth="1" />
        </svg>
      </span>
      <span className="holo-flow-node holo-flow-node--active">{current}</span>
      <span className="holo-flow-arrow" aria-hidden>
        <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
          <path d="M0 4h16M13 1l4 3-4 3" stroke="currentColor" strokeWidth="1" />
        </svg>
      </span>
      <span className="holo-flow-node holo-flow-node--dim">{downstream}</span>
    </div>
  );
}

function BottleneckPanel({
  machine,
  projectedMetrics,
  lineOutputPct,
}: {
  machine: MachineDefinition;
  projectedMetrics: MachineMetric[];
  lineOutputPct: number;
}) {
  const lostOutputPct = Math.max(0, 100 - lineOutputPct);

  return (
    <div className="holo-bottleneck-shell">
      <div className="holo-bottleneck-layout">
        <HoloPane className="holo-bottleneck-visual">
          <div className="holo-preview-frame holo-preview-frame--compact shrink-0">
            <MachinePreviewViewport stationId={machine.id} className="h-full min-h-[112px]" />
            <div className="holo-preview-glow" aria-hidden />
          </div>
          <div className="holo-station-info mt-3 shrink-0">
            <p className="font-fragment text-[10px] uppercase tracking-[0.22em] text-teal-300/65">
              {machine.codename}
            </p>
            <h3 className="mt-1 font-orbitron text-lg leading-tight text-white md:text-xl">
              {machine.name}
            </h3>
            <p className="mt-1 text-[12px] leading-snug text-slate-400/90">{machine.tagline}</p>
          </div>
          <ul className="holo-spec-grid mt-3">
            {machine.specs.map((spec) => (
              <li key={spec.label} className="holo-spec-grid-item">
                <span className="holo-spec-grid-label">{spec.label}</span>
                <span className="holo-spec-grid-value">{spec.value}</span>
              </li>
            ))}
          </ul>
        </HoloPane>

        <div className="holo-bottleneck-readout">
          <div className="holo-impact-hero">
            <div className="holo-impact-hero-row">
              <span className="holo-impact-hero-value font-orbitron tabular-nums">{lineOutputPct}%</span>
              <span className="holo-impact-hero-delta">−{lostOutputPct}% vs design</span>
            </div>
            <span className="holo-impact-hero-caption">Current line rate at this constraint</span>
          </div>

          <div className="holo-diagnosis">
            <p className="holo-diagnosis-kicker">What&apos;s limiting output</p>
            <p className="holo-diagnosis-body">{machine.bottleneck}</p>
          </div>

          <div className="holo-metrics-stack">
            {projectedMetrics.map((metric) => (
              <MetricRow key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </div>

      <div className="holo-bottleneck-band">
        <DataChip label="Upstream" value={machine.upstream} />
        <DataChip label="Takt" value={machine.takt.split(" · ")[0] ?? machine.takt} />
        <DataChip label="Downstream" value={machine.downstream} />
        <DataChip label="Material" value={machine.material} />
      </div>

      <HoloPane className="holo-neofab-resolve">
        <p className="holo-neofab-lead">
          NeoFab rebalances constraints to restore full production flow, clearing the stall at{" "}
          {machine.name.toLowerCase()} and re-syncing upstream takt with downstream demand.
        </p>
        <div className="holo-neofab-tags">
          {machine.capabilities.map((cap) => (
            <span key={cap} className="holo-cap-tag holo-cap-tag--resolve">
              {cap}
            </span>
          ))}
        </div>
        <p className="holo-neofab-caption">
          Optimization targets this node first, then propagates buffer and takt adjustments across{" "}
          {machine.upstream.toLowerCase()} → {machine.downstream.toLowerCase()}.
        </p>
      </HoloPane>
    </div>
  );
}

type HoloTabletProps = {
  machine: MachineDefinition;
  index: number;
  isBottleneckView: boolean;
  showBottleneckAnalysis: boolean;
  storyPhase?: StoryPhase;
  isConstraintStation: boolean;
  optimizePressed?: boolean;
  dismissible?: boolean;
  onClose: (event: React.PointerEvent | React.MouseEvent) => void;
  onOptimize?: () => void;
};

function HoloTablet({
  machine,
  index,
  isBottleneckView,
  showBottleneckAnalysis,
  storyPhase,
  isConstraintStation,
  optimizePressed = false,
  dismissible = true,
  onClose,
  onOptimize,
}: HoloTabletProps) {
  const metricProfile = metricProfileForStory(storyPhase, isBottleneckView);
  const projectedMetrics = projectMetrics(machine.metrics, metricProfile, isConstraintStation);
  const lineOutputPct = lineOutputForProfile(metricProfile);

  return (
    <div
      className={`holo-tablet flex flex-col ${isBottleneckView ? "holo-tablet--bottleneck" : ""}`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="holo-tablet-chrome" aria-hidden>
        <svg className="holo-border-svg" viewBox="0 0 1180 780" preserveAspectRatio="none">
          <rect
            className="holo-border-stroke"
            x="1"
            y="1"
            width="1178"
            height="778"
            rx="3"
            ry="3"
            fill="none"
          />
        </svg>
        <div className="holo-accent-bar" />
        <div className="holo-tablet-edge holo-tablet-edge--top" />
        <div className="holo-tablet-edge holo-tablet-edge--bottom" />
      </div>

      <div className="holo-tablet-body holo-tablet-body--responsive flex min-h-0 flex-1 flex-col">
        <header className="relative shrink-0 px-3 pt-3 md:px-5 md:pt-5">
          <button
            type="button"
            onPointerDown={dismissible ? onClose : undefined}
            onClick={dismissible ? onClose : undefined}
            className="holo-dismiss absolute right-3 top-3 z-20 md:right-5 md:top-5"
            aria-label="Close machine detail view"
            tabIndex={dismissible ? 0 : -1}
            style={dismissible ? undefined : { pointerEvents: "none", opacity: 0.35 }}
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

          <div className="flex items-start justify-between gap-3 pr-11 md:pr-12">
            {isBottleneckView ? (
              <div className="min-w-0">
                <p className="font-fragment text-[10px] uppercase tracking-[0.2em] text-red-300/75">
                  Line constraint
                </p>
                <p className="mt-0.5 font-orbitron text-base leading-tight text-white md:text-lg">
                  {machine.name}
                </p>
              </div>
            ) : (
              <div className={`holo-lock min-w-0 ${isBottleneckView ? "holo-lock--alert" : ""}`}>
                <span className="holo-lock-text">
                  <span className="holo-lock-label">
                    <span className="holo-prefix" aria-hidden>
                      {"//"}
                    </span>
                    Target locked
                  </span>
                  <span className="holo-lock-id">{machine.codename}</span>
                </span>
              </div>
            )}

            <div className="shrink-0 pt-0.5">
              {isBottleneckView ? (
                <span className="holo-status-pill holo-status-pill--alert">Constraint</span>
              ) : (
                <span className="holo-station-index hidden sm:inline">
                  {String(index).padStart(2, "0")} / {String(MACHINE_DEFINITIONS.length).padStart(2, "0")}
                </span>
              )}
            </div>
          </div>
        </header>

        <div
          className={`holo-tablet-scroll min-h-0 flex-1 ${
            isBottleneckView ? "holo-tablet-scroll--bottleneck" : "holo-tablet-scroll--inspect"
          }`}
        >
          <div className="flex flex-col gap-2 px-3 pb-6 pt-1 md:gap-3 md:px-5 md:py-4 md:pb-6">
            {showBottleneckAnalysis && isBottleneckView ? (
              <>
                <LineFlow
                  upstream={machine.upstream}
                  current={machine.name}
                  downstream={machine.downstream}
                />
                <BottleneckPanel
                  machine={machine}
                  projectedMetrics={projectedMetrics}
                  lineOutputPct={lineOutputPct}
                />
              </>
            ) : (
            <>
            {showBottleneckAnalysis && (
              <div className="shrink-0">
                <LineFlow
                  upstream={machine.upstream}
                  current={machine.name}
                  downstream={machine.downstream}
                />
              </div>
            )}

            <div
              className={`grid gap-3 md:gap-3.5 ${
                !showBottleneckAnalysis
                  ? "grid-cols-1"
                  : "grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,0.9fr)]"
              }`}
            >
          <div
            className={`${
              showBottleneckAnalysis ? "hidden min-h-0 min-w-0 md:flex md:flex-col" : "hidden"
            } ${isBottleneckView ? "" : "gap-3"}`}
          >
            {!isBottleneckView ? (
              <>
                <HoloPane>
                  <p className="holo-pane-title">Specifications</p>
                  <ul className="space-y-2">
                    {machine.specs.map((spec) => (
                      <li key={spec.label} className="holo-spec-row">
                        <span>{spec.label}</span>
                        <span>{spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </HoloPane>

                <HoloPane>
                  <p className="holo-pane-title">Process</p>
                  <div className="mt-1 grid grid-cols-1 gap-2">
                    <DataChip label="Operation" value={machine.process} />
                    <DataChip label="Input" value={machine.material} />
                    <DataChip label="Takt" value={machine.takt} />
                  </div>
                </HoloPane>

                <HoloPane>
                  <p className="holo-pane-title">Capabilities</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {machine.capabilities.map((cap) => (
                      <span key={cap} className="holo-cap-tag">
                        {cap}
                      </span>
                    ))}
                  </div>
                </HoloPane>
              </>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col">
            <HoloPane
              className={`flex min-w-0 flex-col ${
                isBottleneckView ? "holo-pane--bottleneck-center" : ""
              }`}
            >
              <div
                className={`holo-preview-frame shrink-0 ${isBottleneckView ? "holo-preview-frame--compact" : "holo-preview-frame--mobile"}`}
              >
                <MachinePreviewViewport
                  stationId={machine.id}
                  className={
                    isBottleneckView
                      ? "h-full min-h-[116px]"
                      : "h-full min-h-[120px] md:min-h-[160px]"
                  }
                />
                <div className="holo-preview-glow" aria-hidden />
              </div>

              <div className="holo-station-info shrink-0">
                <p className="holo-machine-codename font-fragment text-[10px] uppercase tracking-[0.26em] text-teal-300/75">
                  {machine.codename}
                </p>
                <h3 className="holo-machine-name mt-1 font-orbitron text-lg leading-tight text-white md:text-[1.35rem]">
                  {machine.name}
                </h3>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-teal-400/55 md:text-[11px]">
                  {machine.tagline}
                </p>
                {!isBottleneckView ? (
                  <>
                    <p className="mt-2.5 text-[12px] leading-relaxed text-slate-300/88 md:text-[13px]">
                      {machine.description}
                    </p>

                    {showBottleneckAnalysis && (
                      <div className="holo-bottleneck mt-3">
                        <span className="holo-bottleneck-label">Constraint</span>
                        <p>{machine.bottleneck}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              <div
                className={`mt-2 flex flex-col gap-2 ${
                  showBottleneckAnalysis ? "md:hidden" : ""
                }`}
              >
                <DataChip label="Process" value={machine.process} />
                <DataChip label="Takt" value={machine.takt} />
                <DataChip label="Input" value={machine.material} />
              </div>

              <div className={`mt-2 space-y-2.5 ${showBottleneckAnalysis ? "md:hidden" : ""}`}>
                {projectedMetrics.map((metric) => (
                  <MetricRow key={metric.label} metric={metric} />
                ))}
              </div>
            </HoloPane>
          </div>

          <div
            className={`${
              showBottleneckAnalysis ? "hidden min-h-0 min-w-0 md:flex md:flex-col" : "hidden"
            } ${isBottleneckView ? "" : "gap-3"}`}
          >
            {!isBottleneckView ? (
              <>
                <HoloPane>
                  <p className="holo-pane-title">Live telemetry</p>
                  <div className="mt-2 space-y-3.5">
                    {projectedMetrics.map((metric) => (
                      <MetricRow key={metric.label} metric={metric} />
                    ))}
                  </div>
                </HoloPane>

                <HoloPane>
                  <div className="flex items-center justify-between">
                    <p className="holo-pane-title mb-0">System</p>
                    <span className="holo-status-pill">
                      {metricProfile === "optimized" ? "Optimized" : "Operational"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <DataChip
                      label="Node"
                      value={machine.codename.split(" / ")[0] ?? machine.codename}
                    />
                    <DataChip label="Stage" value={`${index} of ${MACHINE_DEFINITIONS.length}`} />
                    <DataChip
                      label="Line output"
                      value={`${lineOutputPct}% design`}
                      className="col-span-2"
                    />
                  </div>
                  <ul className="mt-3 space-y-2 font-mono text-xs leading-relaxed text-teal-300/85 md:text-sm">
                    {metricProfile === "optimized" ? (
                      <>
                        <li className="holo-log-line">&gt; constraint cleared</li>
                        <li className="holo-log-line">&gt; takt balanced upstream</li>
                        <li className="holo-log-line">&gt; production flow restored</li>
                      </>
                    ) : (
                      <>
                        <li className="holo-log-line">&gt; geometry acquired</li>
                        <li className="holo-log-line">&gt; telemetry synced</li>
                        <li className="holo-log-line">&gt; awaiting bottleneck scan</li>
                      </>
                    )}
                  </ul>
                </HoloPane>
              </>
            ) : null}
          </div>
            </div>
            </>
            )}
          </div>
        </div>

      {isBottleneckView && onOptimize ? (
        <footer className="holo-footer holo-footer--compact shrink-0 px-3 pb-3 pt-3 md:px-5 md:pb-5">
          <div className="flex w-full flex-col items-center gap-2.5 text-center">
            <p className="holo-footer-lead text-teal-100/72">
              Run NeoFab optimization to fix the constraint, recover lost throughput, and bring the line back to target rate.
            </p>
            <motion.div
              aria-hidden
              tabIndex={-1}
              animate={
                optimizePressed
                  ? { scale: 0.96, y: 1 }
                  : { scale: 1, y: 0 }
              }
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`holo-optimize-cta holo-optimize-cta--footer holo-optimize-cta--demo w-full md:w-auto ${
                optimizePressed ? "holo-optimize-cta--pressed" : ""
              }`}
            >
              <span>Optimize factory with NeoFab</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
              <span className="holo-optimize-cta-ripple" aria-hidden />
            </motion.div>
          </div>
        </footer>
      ) : null}
      </div>
    </div>
  );
}

export default function MachineHologramOverlay({
  stationId,
  visible,
  variant = "inspect",
  showBottleneckAnalysis = true,
  storyPhase,
  bottleneckStationId,
  optimizePressed = false,
  dismissible = true,
  onClose,
  onOptimize,
}: MachineHologramOverlayProps) {
  const machine = stationId ? MACHINE_MAP.get(stationId) : null;
  const index = machine ? stationIndex(machine.id) : 0;
  const isBottleneckView = variant === "bottleneck";
  const isConstraintStation = Boolean(machine && bottleneckStationId === machine.id);

  const handleClose = useCallback(
    (event: React.PointerEvent | React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    },
    [onClose]
  );

  const stopOverlayScrollPropagation = useCallback((event: React.WheelEvent | React.TouchEvent) => {
    event.stopPropagation();
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible || !dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, dismissible, onClose]);

  if (!mounted) return null;

  return createPortal(
    <SafeAnimatePresence>
      {visible && machine && (
        <motion.div
          key={machine.id}
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 6, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="holo-overlay holo-overlay--instant pointer-events-auto fixed inset-0 z-[110] flex items-start justify-center md:items-center"
          onWheel={stopOverlayScrollPropagation}
          onTouchMove={stopOverlayScrollPropagation}
        >
          <div
            className="holo-backdrop"
            onPointerDown={dismissible ? handleClose : undefined}
            onClick={dismissible ? handleClose : undefined}
            style={dismissible ? undefined : { pointerEvents: "none" }}
          />
          <div className="holo-vignette" aria-hidden />
          <div className="holo-grid" aria-hidden />

          <HoloTablet
            machine={machine}
            index={index}
            isBottleneckView={isBottleneckView}
            showBottleneckAnalysis={showBottleneckAnalysis}
            storyPhase={storyPhase}
            isConstraintStation={isConstraintStation}
            optimizePressed={optimizePressed}
            dismissible={dismissible}
            onClose={handleClose}
            onOptimize={showBottleneckAnalysis ? onOptimize : undefined}
          />
        </motion.div>
      )}
    </SafeAnimatePresence>,
    document.body
  );
}
