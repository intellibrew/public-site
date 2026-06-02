"use client";

import { motion } from "framer-motion";
import type { ConveyorPanelMetrics } from "@/lib/factory/flowOptimization";

type ConveyorFlowOverlayProps = {
  visible: boolean;
  metrics: ConveyorPanelMetrics;
  onClose: () => void;
};

export default function ConveyorFlowOverlay({
  visible,
  metrics,
  onClose,
}: ConveyorFlowOverlayProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="conveyor-flow-overlay pointer-events-none fixed inset-0 z-[105]"
    >
      <button
        type="button"
        onClick={onClose}
        className="conveyor-flow-backdrop pointer-events-auto absolute inset-0"
        aria-label="Close conveyor flow view"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="conveyor-flow-panel pointer-events-auto absolute left-1/2 top-[calc(70px+1rem)] w-[min(92vw,560px)] -translate-x-1/2"
      >
        <div className="conveyor-flow-panel-inner">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="conveyor-flow-kicker">Production flow</p>
              <div className="mt-1 flex flex-wrap items-center gap-2.5">
                <h2 className="conveyor-flow-title">Conveyor line view</h2>
                <span
                  className={`conveyor-flow-status conveyor-flow-status--${metrics.lineStatusTone}`}
                >
                  {metrics.lineStatus}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="conveyor-flow-close shrink-0"
              aria-label="Close conveyor flow view"
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
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="conveyor-flow-stat">
              <span className="conveyor-flow-stat-label">Production / hr</span>
              <span className="conveyor-flow-stat-value">{metrics.productionPerHour}</span>
              <span className="conveyor-flow-stat-unit">units</span>
            </div>
            <div className="conveyor-flow-stat">
              <span className="conveyor-flow-stat-label">Line speed</span>
              <span className="conveyor-flow-stat-value">{metrics.lineSpeedPct}%</span>
            </div>
            <div className="conveyor-flow-stat">
              <span className="conveyor-flow-stat-label">WIP on belt</span>
              <span className="conveyor-flow-stat-value">{metrics.activeUnits}</span>
              <span className="conveyor-flow-stat-unit">{metrics.wipLoadPct}% load</span>
            </div>
            <div className="conveyor-flow-stat">
              <span className="conveyor-flow-stat-label">Cycle time</span>
              <span className="conveyor-flow-stat-value">{metrics.cycleTimeSec}s</span>
              <span className="conveyor-flow-stat-unit">avg / unit</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
