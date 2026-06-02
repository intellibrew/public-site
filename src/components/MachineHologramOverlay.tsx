"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { FC, PropsWithChildren } from "react";
import {
  MACHINE_DEFINITIONS,
  MACHINE_MAP,
  type MachineDefinition,
} from "@/lib/factory/machineRegistry";
import MachinePreviewViewport from "@/components/MachinePreviewViewport";
import { playHoloEnterAnimation, splitChars } from "@/lib/animations/holoEnter";

const SafeAnimatePresence = AnimatePresence as FC<
  PropsWithChildren<{ mode?: "wait" | "sync" | "popLayout" }>
>;

type MachineHologramOverlayProps = {
  stationId: string | null;
  visible: boolean;
  variant?: "inspect" | "bottleneck";
  onClose: () => void;
  onOptimize?: () => void;
};

function stationIndex(id: string) {
  return MACHINE_DEFINITIONS.findIndex((m) => m.id === id) + 1;
}

function SplitText({ text }: { text: string }) {
  return (
    <>
      {splitChars(text).map(({ key, char, className }) => (
        <span key={key} className={className}>
          {char}
        </span>
      ))}
    </>
  );
}

function MetricRow({ metric }: { metric: MachineDefinition["metrics"][number] }) {
  const pct = (metric.value / metric.max) * 100;
  const decimals = metric.unit === "%" || metric.unit === "s" ? 1 : 0;

  return (
    <div className="holo-metric-row">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.16em] text-teal-300/55">
          {metric.label}
        </span>
        <span
          className="holo-metric-value font-orbitron text-[13px] tabular-nums text-teal-100"
        >
          <span
            className="holo-metric-num"
            data-value={metric.value}
            data-decimals={decimals}
          >
            0
          </span>
          {metric.unit && (
            <span className="holo-metric-unit ml-0.5 text-[9px] font-normal text-teal-400/60">
              {metric.unit}
            </span>
          )}
        </span>
      </div>
      <div className="holo-metric-track">
        <div className="holo-metric-fill" data-width={`${pct}%`} style={{ width: "0%" }} />
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
    <div className={`holo-glass-pane holo-enter-pane ${className}`}>
      {children}
    </div>
  );
}

function DataChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="holo-data-chip">
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

type HoloTabletProps = {
  machine: MachineDefinition;
  index: number;
  isBottleneckView: boolean;
  onClose: (event: React.PointerEvent | React.MouseEvent) => void;
  onOptimize?: () => void;
};

function HoloTablet({
  machine,
  index,
  isBottleneckView,
  onClose,
  onOptimize,
}: HoloTabletProps) {
  const tabletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tablet = tabletRef.current;
    if (!tablet) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) return;

    let ctx: ReturnType<typeof playHoloEnterAnimation> | undefined;
    const frameId = requestAnimationFrame(() => {
      ctx = playHoloEnterAnimation(tablet, { alert: isBottleneckView });
    });

    return () => {
      cancelAnimationFrame(frameId);
      ctx?.revert();
    };
  }, [machine.id, isBottleneckView]);

  return (
    <div
      ref={tabletRef}
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
        <div className="holo-scan" />
        <div className="holo-flash" />
        <div className="holo-accent-bar" />
        <div className="holo-tablet-edge holo-tablet-edge--top" />
        <div className="holo-tablet-edge holo-tablet-edge--bottom" />
      </div>

      <div className="holo-tablet-body holo-tablet-body--responsive flex min-h-0 flex-1 flex-col">
        <header className="relative shrink-0 px-3 pt-3 md:px-5 md:pt-5">
          <button
            type="button"
            onPointerDown={onClose}
            onClick={onClose}
            className="holo-dismiss absolute right-3 top-3 z-20 md:right-5 md:top-5"
            aria-label="Close machine detail view"
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

          <div className="flex items-center gap-3 pr-11 md:pr-12">
            <div className={`holo-lock min-w-0 ${isBottleneckView ? "holo-lock--alert" : ""}`}>
          <span className="holo-lock-text">
            <span className="holo-lock-label">
              <span className="holo-prefix" aria-hidden>
                //
              </span>
              <SplitText
                text={isBottleneckView ? "Bottleneck detected" : "Target locked"}
              />
            </span>
            <span className="holo-lock-id">{machine.codename}</span>
          </span>
            </div>

            <div className="shrink-0">
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
            <div className="shrink-0">
              <LineFlow
                upstream={machine.upstream}
                current={machine.name}
                downstream={machine.downstream}
              />
            </div>

            <div
              className={`grid gap-3 md:gap-3.5 ${
                isBottleneckView
                  ? "grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)_minmax(0,0.85fr)]"
                  : "grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,0.9fr)]"
              }`}
            >
          <div
            className={`hidden min-h-0 min-w-0 md:flex md:flex-col ${isBottleneckView ? "" : "gap-3"}`}
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
            ) : (
              <HoloPane className="flex-1">
                <p className="holo-pane-title">Line impact</p>
                <div className="mt-3 space-y-3">
                  <DataChip label="Upstream" value={machine.upstream} />
                  <DataChip label="Downstream" value={machine.downstream} />
                  <DataChip
                    label="Current takt"
                    value={machine.takt.split(" · ")[0] ?? machine.takt}
                  />
                </div>
                <ul className="mt-4 space-y-2 font-mono text-xs leading-relaxed text-red-300/90 md:text-sm">
                  <li className="holo-log-line">&gt; queue depth rising upstream</li>
                  <li className="holo-log-line">&gt; downstream stations starved</li>
                  <li className="holo-log-line">&gt; full line halt imminent</li>
                </ul>
              </HoloPane>
            )}
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
                  <SplitText text={machine.name} />
                </h3>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-teal-400/55 md:text-[11px]">
                  {machine.tagline}
                </p>
                {isBottleneckView ? (
                  <div className="holo-bottleneck holo-bottleneck--embedded mt-3">
                    <span className="holo-bottleneck-label">Root cause</span>
                    <p>{machine.bottleneck}</p>
                  </div>
                ) : (
                  <>
                    <p className="mt-2.5 text-[12px] leading-relaxed text-slate-300/88 md:text-[13px]">
                      {machine.description}
                    </p>

                    <div className="holo-bottleneck mt-3">
                      <span className="holo-bottleneck-label">Constraint</span>
                      <p>{machine.bottleneck}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-2 flex flex-col gap-2 md:hidden">
                <DataChip label="Process" value={machine.process} />
                <DataChip label="Takt" value={machine.takt} />
                <DataChip label="Input" value={machine.material} />
              </div>

              <div className="mt-2 space-y-2.5 md:hidden">
                {machine.metrics.map((metric) => (
                  <MetricRow key={metric.label} metric={metric} />
                ))}
              </div>
            </HoloPane>
          </div>

          <div
            className={`hidden min-h-0 min-w-0 md:flex md:flex-col ${isBottleneckView ? "" : "gap-3"}`}
          >
            {!isBottleneckView ? (
              <>
                <HoloPane>
                  <p className="holo-pane-title">Live telemetry</p>
                  <div className="mt-2 space-y-3.5">
                    {machine.metrics.map((metric) => (
                      <MetricRow key={metric.label} metric={metric} />
                    ))}
                  </div>
                </HoloPane>

                <HoloPane>
                  <div className="flex items-center justify-between">
                    <p className="holo-pane-title mb-0">System</p>
                    <span className="holo-status-pill">Operational</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <DataChip
                      label="Node"
                      value={machine.codename.split(" / ")[0] ?? machine.codename}
                    />
                    <DataChip label="Stage" value={`${index} of ${MACHINE_DEFINITIONS.length}`} />
                  </div>
                  <ul className="mt-3 space-y-2 font-mono text-xs leading-relaxed text-teal-300/85 md:text-sm">
                    <li className="holo-log-line">&gt; geometry acquired</li>
                    <li className="holo-log-line">&gt; telemetry synced</li>
                    <li className="holo-log-line">&gt; render pipeline OK</li>
                  </ul>
                </HoloPane>
              </>
            ) : (
              <HoloPane className="flex-1">
                <p className="holo-pane-title">Throughput loss</p>
                <div className="mt-3 space-y-3.5">
                  {machine.metrics.slice(0, 3).map((metric) => (
                    <MetricRow key={metric.label} metric={metric} />
                  ))}
                </div>
                <p className="mt-4 text-[11px] leading-relaxed text-amber-100/70">
                  Estimated line output is at 48% of design rate until this node is cleared.
                </p>
              </HoloPane>
            )}
          </div>
            </div>
          </div>
        </div>

      {isBottleneckView && onOptimize ? (
        <footer className="holo-footer shrink-0 px-3 pb-3 pt-2 md:px-5 md:pb-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="max-w-md text-[11px] leading-relaxed text-teal-100/72 md:text-[12px]">
              NeoFab rebalances constraints to restore full production flow.
            </p>
            <button
              type="button"
              onClick={onOptimize}
              className="holo-optimize-cta holo-optimize-cta--footer"
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
            </button>
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
  onClose,
  onOptimize,
}: MachineHologramOverlayProps) {
  const machine = stationId ? MACHINE_MAP.get(stationId) : null;
  const index = machine ? stationIndex(machine.id) : 0;
  const isBottleneckView = variant === "bottleneck";

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
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, onClose]);

  if (!mounted) return null;

  return createPortal(
    <SafeAnimatePresence>
      {visible && machine && (
        <motion.div
          key={machine.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
          transition={{ duration: 0.32 }}
          className="holo-overlay pointer-events-auto fixed inset-0 z-[110] flex items-start justify-center px-2 pb-4 pt-[calc(70px+0.35rem)] sm:px-3 sm:pb-5 sm:pt-[calc(70px+0.5rem)] md:items-center md:px-5 md:pb-5 md:pt-[calc(70px+1rem)]"
          onWheel={stopOverlayScrollPropagation}
          onTouchMove={stopOverlayScrollPropagation}
        >
          <div
            className="holo-backdrop"
            onPointerDown={handleClose}
            onClick={handleClose}
          />
          <div className="holo-vignette" aria-hidden />
          <div className="holo-grid" aria-hidden />

          <HoloTablet
            machine={machine}
            index={index}
            isBottleneckView={isBottleneckView}
            onClose={handleClose}
            onOptimize={onOptimize}
          />
        </motion.div>
      )}
    </SafeAnimatePresence>,
    document.body
  );
}
