"use client";

import { useState } from "react";
import type { FC, PropsWithChildren } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SafeAnimatePresence = AnimatePresence as FC<PropsWithChildren>;

interface Station {
  id: string;
  x: number;
  y: number;
  name: string;
  cycleTime: string;
  automation: string;
  handling: string;
  status: "optimal" | "bottleneck" | "normal";
}

const CENTER_X = 70;
const CENTER_Y = 45;
const SPACING_SCALE_X = 1.35;
const SPACING_SCALE_Y = 1.12;

function transformCoords(x: number, y: number): { x: number; y: number } {
  const centeredX = x - CENTER_X + 50;
  const centeredY = y - CENTER_Y + 50;
  return {
    x: 50 + (centeredX - 50) * SPACING_SCALE_X,
    y: 50 + (centeredY - 50) * SPACING_SCALE_Y,
  };
}

const stations: Station[] = [
  { id: "1", x: 48, y: 25, name: "Material Receiving", cycleTime: "60s", automation: "Semi-auto", handling: "AGV", status: "normal" },
  { id: "2", x: 60, y: 25, name: "Blanking Press", cycleTime: "45s", automation: "Full-auto", handling: "Conveyor", status: "normal" },
  { id: "3", x: 72, y: 25, name: "Stamping Cell", cycleTime: "38s", automation: "Full-auto", handling: "Conveyor", status: "optimal" },
  { id: "4", x: 84, y: 25, name: "Welding Station", cycleTime: "52s", automation: "Full-auto", handling: "Conveyor", status: "normal" },
  { id: "5", x: 84, y: 45, name: "Sub-Assembly", cycleTime: "180s", automation: "Manual", handling: "Manual", status: "bottleneck" },
  { id: "6", x: 92, y: 45, name: "E-Coat", cycleTime: "120s", automation: "Full-auto", handling: "Conveyor", status: "normal" },
  { id: "7", x: 92, y: 65, name: "Paint Booth", cycleTime: "90s", automation: "Full-auto", handling: "Conveyor", status: "normal" },
  { id: "8", x: 80, y: 65, name: "Final Assembly", cycleTime: "150s", automation: "Semi-auto", handling: "Manual", status: "optimal" },
  { id: "9", x: 68, y: 65, name: "QC Inspection", cycleTime: "45s", automation: "Full-auto", handling: "Conveyor", status: "normal" },
  { id: "10", x: 56, y: 65, name: "Packaging", cycleTime: "60s", automation: "Semi-auto", handling: "AGV", status: "normal" },
];

const STATUS_STYLES = {
  optimal: {
    main: "rgba(56,189,248,0.98)", 
    glow: "0 0 18px rgba(56,189,248,0.7)",
    ring: "rgba(56,189,248,0.8)",
  },
  bottleneck: {
    main: "rgba(248,113,113,0.98)", 
    glow: "0 0 18px rgba(248,113,113,0.75)",
    ring: "rgba(248,113,113,0.85)",
  },
  normal: {
    main: "rgba(129,140,248,0.98)", 
    glow: "0 0 18px rgba(129,140,248,0.7)",
    ring: "rgba(129,140,248,0.8)",
  },
} as const;

type FactoryFlowMapProps = {
  onActiveChange?: (position: { x: number; y: number } | null) => void;
};

export default function FactoryFlowMap({ onActiveChange }: FactoryFlowMapProps) {
  const [active, setActive] = useState<Station | null>(null);

  const buildPath = () => {
    const t0 = transformCoords(stations[0].x, stations[0].y);
    let d = `M ${t0.x} ${t0.y}`;
    for (let i = 1; i < stations.length; i++) {
      const prev = stations[i - 1];
      const curr = stations[i];
      const tc = transformCoords(curr.x, curr.y);
      if (prev.y === curr.y) d += ` L ${tc.x} ${tc.y}`;
      else if (prev.x === curr.x) d += ` L ${tc.x} ${tc.y}`;
      else {
        const mid = transformCoords(prev.x, curr.y);
        d += ` L ${mid.x} ${mid.y} L ${tc.x} ${tc.y}`;
      }
    }
    return d;
  };

  const pathD = buildPath();

  const getTooltipStyle = (station: Station): React.CSSProperties => {
    const t = transformCoords(station.x, station.y);
    const top = t.y > 50 ? t.y - 18 : t.y + 8;
    const maxWidth = "calc(100% - 1rem)";

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) {
      if (t.x >= 55) {
        return {
          right: "0.5rem",
          left: "auto",
          top: `${top}%`,
          transform: "translate(0, -50%)",
          maxWidth,
        };
      }
      if (t.x <= 45) {
        return {
          left: "0.5rem",
          top: `${top}%`,
          transform: "translate(0, -50%)",
          maxWidth,
        };
      }
      return {
        left: `${t.x}%`,
        top: `${top}%`,
        transform: "translate(-50%, -50%)",
        maxWidth,
      };
    }

    if (t.x > 82) {
      return { right: "0.5rem", left: "auto", top: `${top}%`, transform: "translate(0, -50%)", maxWidth };
    }
    if (t.x < 18) {
      return { left: "0.5rem", top: `${top}%`, transform: "translate(0, -50%)", maxWidth };
    }
    return { left: `${t.x}%`, top: `${top}%`, transform: "translate(-50%, -50%)", maxWidth };
  };

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="flowLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.14)" />
            <stop offset="30%" stopColor="rgba(59,130,246,0.4)" />
            <stop offset="70%" stopColor="rgba(59,130,246,0.4)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.18)" />
          </linearGradient>
          <filter id="flowLineBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="particleBlur" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="particleFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="70%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </radialGradient>
        </defs>

        <path
          d={pathD}
          fill="none"
          stroke="rgba(59,130,246,0.18)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={pathD}
          fill="none"
          stroke="url(#flowLineGradient)"
          strokeWidth="0.45"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#flowLineBlur)"
        />

        <circle r="0.55" fill="url(#particleFill)" filter="url(#particleBlur)">
          <animateMotion dur="14s" repeatCount="indefinite" path={pathD} calcMode="linear" />
          <animate attributeName="opacity" values="0;0.95;0.95;0.95;0" dur="14s" repeatCount="indefinite" />
        </circle>
      </svg>

      {stations.map((station) => {
        const style = STATUS_STYLES[station.status];
        const isActive = active?.id === station.id;
        const t = transformCoords(station.x, station.y);

        return (
          <motion.button
            key={station.id}
            type="button"
            className="absolute cursor-pointer touch-manipulation rounded-full border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02060e]"
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            onMouseEnter={() => {
              const t = transformCoords(station.x, station.y);
              setActive(station);
              onActiveChange?.(t);
            }}
            onMouseLeave={() => {
              setActive(null);
              onActiveChange?.(null);
            }}
            onFocus={() => {
              const t = transformCoords(station.x, station.y);
              setActive(station);
              onActiveChange?.(t);
            }}
            onBlur={() => {
              setActive(null);
              onActiveChange?.(null);
            }}
            aria-label={station.name}
            initial={false}
            animate={{
              scale: isActive ? 1.2 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.span
              className="absolute inset-0 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: "50%",
                top: "50%",
                width: isActive ? 22 : 16,
                height: isActive ? 22 : 16,
                borderColor: isActive ? style.main : style.ring,
                borderWidth: 1.5,
                opacity: isActive ? 0.95 : 0.7,
                boxShadow: isActive ? style.glow : "none",
              }}
            />
            <motion.span
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: "50%",
                top: "50%",
                width: isActive ? 11 : 8.5,
                height: isActive ? 11 : 8.5,
                backgroundColor: style.main,
                boxShadow: isActive ? style.glow : `0 0 14px ${style.main}60`,
              }}
            />
          </motion.button>
        );
      })}

      <SafeAnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute z-50 pointer-events-none"
            style={getTooltipStyle(active)}
          >
            <div
              className="px-4 py-3 rounded-xl min-w-[160px] max-w-full border border-slate-700/80"
              style={{
                background: "rgba(15,23,42,0.96)",
                boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px rgba(0,0,0,0.4), 0 0 32px ${STATUS_STYLES[active.status].main}18`,
              }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: STATUS_STYLES[active.status].main,
                    boxShadow: STATUS_STYLES[active.status].glow,
                  }}
                />
                <p className="text-white font-semibold text-[13px] tracking-wide font-orbitron">
                  {active.name}
                </p>
              </div>
              <div className="space-y-1.5 text-[12px]">
                <div className="flex justify-between gap-6 text-slate-400">
                  <span>Cycle</span>
                  <span className="text-slate-200 font-medium tabular-nums">{active.cycleTime}</span>
                </div>
                <div className="flex justify-between gap-6 text-slate-400">
                  <span>Mode</span>
                  <span className="text-slate-200 font-medium">{active.automation}</span>
                </div>
                <div className="flex justify-between gap-6 text-slate-400">
                  <span>Handling</span>
                  <span className="text-slate-200 font-medium">{active.handling}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </SafeAnimatePresence>
    </div>
  );
}
