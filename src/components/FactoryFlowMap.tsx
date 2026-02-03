"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    main: "#22c55e",
    glow: "0 0 24px rgba(34,197,94,0.5)",
    ring: "rgba(34,197,94,0.5)",
  },
  bottleneck: {
    main: "#ef4444",
    glow: "0 0 24px rgba(239,68,68,0.5)",
    ring: "rgba(239,68,68,0.5)",
  },
  normal: {
    main: "#3b82f6",
    glow: "0 0 24px rgba(59,130,246,0.5)",
    ring: "rgba(59,130,246,0.5)",
  },
} as const;

export default function FactoryFlowMap() {
  const [active, setActive] = useState<Station | null>(null);

  const buildPath = () => {
    let d = `M ${stations[0].x} ${stations[0].y}`;
    for (let i = 1; i < stations.length; i++) {
      const prev = stations[i - 1];
      const curr = stations[i];
      if (prev.y === curr.y) d += ` L ${curr.x} ${curr.y}`;
      else if (prev.x === curr.x) d += ` L ${curr.x} ${curr.y}`;
      else d += ` L ${prev.x} ${curr.y} L ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const pathD = buildPath();

  const getTooltipStyle = (station: Station): React.CSSProperties => {
    const top = station.y > 50 ? station.y - 18 : station.y + 8;
    if (station.x > 82) {
      return { right: "1rem", left: "auto", top: `${top}%`, transform: "translate(0, -50%)" };
    }
    let transform = "translate(-50%, 0)";
    if (station.x < 54) transform = "translate(-8%, 0)";
    return { left: `${station.x}%`, top: `${top}%`, transform };
  };

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 320px 240px at ${active.x}% ${active.y}%, transparent 0%, rgba(2,6,14,0.82) 100%)`,
            }}
          />
        )}
      </AnimatePresence>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="flowLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.12)" />
            <stop offset="50%" stopColor="rgba(96,165,250,0.28)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.12)" />
          </linearGradient>
          <filter id="flowLineBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="blur" />
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
          stroke="rgba(59,130,246,0.08)"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={pathD}
          fill="none"
          stroke="url(#flowLineGradient)"
          strokeWidth="0.18"
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

        return (
          <motion.button
            key={station.id}
            type="button"
            className="absolute cursor-pointer touch-manipulation rounded-full border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02060e]"
            style={{ left: `${station.x}%`, top: `${station.y}%` }}
            onMouseEnter={() => setActive(station)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(station)}
            onBlur={() => setActive(null)}
            aria-label={station.name}
            initial={false}
            animate={{
              scale: isActive ? 1.2 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <motion.span
              className="absolute inset-0 rounded-full border-2 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: "50%",
                top: "50%",
                width: isActive ? 22 : 18,
                height: isActive ? 22 : 18,
                borderColor: isActive ? style.main : style.ring,
                opacity: isActive ? 0.9 : 0.45,
                boxShadow: isActive ? style.glow : "none",
              }}
            />
            <motion.span
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: "50%",
                top: "50%",
                width: isActive ? 12 : 10,
                height: isActive ? 12 : 10,
                backgroundColor: style.main,
                boxShadow: isActive ? style.glow : `0 0 12px ${style.main}60`,
              }}
            />
            <motion.span
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 bg-white/80"
              style={{
                left: "50%",
                top: "50%",
                width: isActive ? 4 : 3,
                height: isActive ? 4 : 3,
                marginLeft: "-1.5px",
                marginTop: "-1.5px",
              }}
            />
          </motion.button>
        );
      })}

      <AnimatePresence>
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
              className="px-4 py-3 rounded-xl min-w-[200px] border border-slate-700/80"
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
      </AnimatePresence>
    </div>
  );
}
