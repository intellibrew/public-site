"use client";

import type { CSSProperties } from "react";

type ProblemRingDiagramProps = {
  className?: string;
};

const ARCS = [
  "M293.9,69.2 A140,140 0 0 1 395.8,171.1",
  "M395.8,238.9 A140,140 0 0 1 293.9,340.8",
  "M226.1,340.8 A140,140 0 0 1 124.2,238.9",
  "M124.2,171.1 A140,140 0 0 1 226.1,69.2",
] as const;

const ARC_JUNCTIONS = [
  [293.9, 69.2],
  [395.8, 171.1],
  [395.8, 238.9],
  [293.9, 340.8],
  [226.1, 340.8],
  [124.2, 238.9],
  [124.2, 171.1],
  [226.1, 69.2],
] as const;

const TEAM_NODES = [
  { cx: 260, cy: 65, label: "Design", anchor: "middle" as const, x: 260, y: 44 },
  { cx: 400, cy: 205, label: "Mechanical Eng", anchor: "start" as const, x: 418, y: 209 },
  { cx: 260, cy: 345, label: "Manufacturing", anchor: "middle" as const, x: 260, y: 374 },
  { cx: 120, cy: 205, label: "Supply chain", anchor: "end" as const, x: 102, y: 209 },
];

const DISCONNECTS = [
  [359, 106],
  [359, 304],
  [161, 304],
  [161, 106],
] as const;

const CHIPS = [
  { label: "CAD", path: ARCS[0], begin: "0s", width: 52, x: -26 },
  { label: "BOM", path: ARCS[1], begin: "-1.25s", width: 52, x: -26 },
  { label: "takt", path: ARCS[2], begin: "-2.5s", width: 48, x: -24 },
  { label: "cost", path: ARCS[3], begin: "-3.75s", width: 52, x: -26 },
] as const;

export function ProblemRingDiagram({ className }: ProblemRingDiagramProps) {
  return (
    <div className={`factory-narrative-ring-wrap${className ? ` ${className}` : ""}`}>
      <svg
        className="factory-narrative-ring-svg"
        viewBox="-26 0 592 400"
        role="img"
        aria-label="Four teams in a broken loop, information stalling at every handoff"
      >
        <defs>
          <radialGradient id="narrativeRingHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(47,230,176,0.14)" />
            <stop offset="58%" stopColor="rgba(47,230,176,0.04)" />
            <stop offset="100%" stopColor="rgba(47,230,176,0)" />
          </radialGradient>
          <linearGradient id="narrativeArcStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(232,137,92,0.35)" />
            <stop offset="50%" stopColor="rgba(232,137,92,0.82)" />
            <stop offset="100%" stopColor="rgba(232,137,92,0.35)" />
          </linearGradient>
          <linearGradient id="narrativeStackFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(10,16,18,0.94)" />
            <stop offset="100%" stopColor="rgba(6,10,12,0.88)" />
          </linearGradient>
          <linearGradient id="narrativeStackStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(232,137,92,0.22)" />
            <stop offset="50%" stopColor="rgba(47,230,176,0.18)" />
            <stop offset="100%" stopColor="rgba(232,137,92,0.22)" />
          </linearGradient>
          <filter id="narrativeTealGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="narrativeChipGlow" x="-50%" y="-80%" width="200%" height="260%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="rgba(232,137,92,0.35)" />
          </filter>
        </defs>

        <ellipse
          className="factory-narrative-ring-halo"
          cx="260"
          cy="205"
          rx="198"
          ry="178"
          fill="url(#narrativeRingHalo)"
        />

        <g fill="none" stroke="url(#narrativeArcStroke)" strokeWidth="1.4" strokeLinecap="round" opacity="0.72">
          {ARCS.map((d, index) => (
            <path
              key={d}
              className="factory-narrative-arc"
              style={{ "--arc-i": index } as CSSProperties}
              d={d}
            />
          ))}
        </g>

        <g fill="var(--narrative-coral)" opacity="0.85">
          {ARC_JUNCTIONS.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.2" />
          ))}
        </g>

        {TEAM_NODES.map((node, index) => (
          <g
            key={node.label}
            className="factory-narrative-team-node"
            style={{ "--node-i": index } as CSSProperties}
          >
            <circle
              className="factory-narrative-node-halo"
              cx={node.cx}
              cy={node.cy}
              r="14"
              fill="none"
              stroke="var(--narrative-teal)"
              strokeWidth="1"
              opacity="0.22"
            />
            <circle
              cx={node.cx}
              cy={node.cy}
              r="9"
              fill="none"
              stroke="var(--narrative-teal)"
              strokeWidth="1.8"
              filter="url(#narrativeTealGlow)"
            />
            <circle cx={node.cx} cy={node.cy} r="2.8" fill="var(--narrative-teal)" />
            <text
              className="factory-narrative-teamlab"
              x={node.x}
              y={node.y}
              textAnchor={node.anchor}
            >
              {node.label}
            </text>
          </g>
        ))}

        <g className="factory-narrative-disconnects" stroke="var(--narrative-coral)" strokeWidth="2" strokeLinecap="round">
          {DISCONNECTS.map(([x, y], index) => (
            <g
              key={`${x}-${y}`}
              className="factory-narrative-disconnect"
              style={{ "--dc-i": index } as CSSProperties}
              transform={`translate(${x},${y})`}
            >
              <line x1="-5" y1="-5" x2="5" y2="5" />
              <line x1="5" y1="-5" x2="-5" y2="5" />
            </g>
          ))}
        </g>

        <g className="factory-narrative-stack">
          <rect
            x="162"
            y="173"
            width="196"
            height="64"
            rx="12"
            fill="url(#narrativeStackFill)"
            stroke="url(#narrativeStackStroke)"
            strokeWidth="1"
          />
          <rect
            x="163.5"
            y="174.5"
            width="193"
            height="61"
            rx="10.5"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
          <text
            x="260"
            y="190"
            textAnchor="middle"
            className="factory-narrative-stack-kicker"
          >
            THE DISCONNECTED STACK
          </text>
          <text x="260" y="209" textAnchor="middle" className="factory-narrative-stack-line">
            Excel · PLM · ERP
          </text>
          <text x="260" y="227" textAnchor="middle" className="factory-narrative-stack-line">
            PDFs · Email · MES
          </text>
        </g>

        <g className="factory-narrative-infochip">
          {CHIPS.map((chip) => (
            <g key={chip.label}>
              <g filter="url(#narrativeChipGlow)">
                <rect
                  x={chip.x}
                  y="-11"
                  width={chip.width}
                  height="22"
                  rx="11"
                  fill="rgba(8,12,14,0.96)"
                  stroke="var(--narrative-coral-dim)"
                  strokeWidth="1"
                />
                <text x="0" y="4" textAnchor="middle">
                  {chip.label}
                </text>
              </g>
              <animateMotion dur="5s" begin={chip.begin} repeatCount="indefinite" path={chip.path} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
