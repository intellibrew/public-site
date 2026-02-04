"use client";

import { useState, useEffect } from "react";
import type { FC, PropsWithChildren } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SafeAnimatePresence = AnimatePresence as FC<PropsWithChildren>;

const dataNodes = [
  { label: "CAD", tooltip: "Design files and drawings" },
  { label: "BOM", tooltip: "Bill of materials" },
  { label: "Tribal Knowledge", tooltip: "Expertise locked in people" },
  { label: "Vendor PDFs", tooltip: "Scattered vendor documents" },
  { label: "Spreadsheets", tooltip: "Manual data and specs" },
];

const DESIGN_SIZE = 484; 

const SECTION_PADDING = 32;
const LABEL_PADDING = 40;
const NARROW_BREAKPOINT = 520;
const MIN_SCALE = 0.65;

function getScaleForViewport(): number {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  if (w >= NARROW_BREAKPOINT) return 1;
  const availableWidth = w - SECTION_PADDING;
  const maxDiagramWithPadding = availableWidth - LABEL_PADDING * 2;
  return Math.min(1, Math.max(MIN_SCALE, maxDiagramWithPadding / DESIGN_SIZE));
}

export default function AdvancedFactoryAnimation() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const nodeCount = dataNodes.length;
  const size = DESIGN_SIZE;
  const center = size / 2;
  const orbitRadius = 192; 
  const centerRadius = 60; 

  useEffect(() => {
    const update = () => setScale(getScaleForViewport());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getNodePosition = (index: number) => {
    const angleDeg = (index * 360) / nodeCount - 90;
    const angleRad = angleDeg * (Math.PI / 180);
    return {
      x: center + orbitRadius * Math.cos(angleRad),
      y: center + orbitRadius * Math.sin(angleRad),
    };
  };

  const scaledSize = size * scale;
  const isNarrow = scale < 1;
  const availableWidth = typeof window !== "undefined" ? window.innerWidth - SECTION_PADDING : size;
  const wrapperSize = isNarrow
    ? Math.min(scaledSize + LABEL_PADDING * 2, availableWidth)
    : size;

  return (
    <div
      className="relative mx-auto overflow-visible"
      style={{
        width: wrapperSize,
        height: wrapperSize,
        maxWidth: "100%",
      }}
    >
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          ...(isNarrow ? { position: "absolute" as const, left: LABEL_PADDING / 2, top: LABEL_PADDING / 2 } : {}),
        }}
      >
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -80,
          background: "radial-gradient(circle, rgba(251,113,133,0.05) 0%, transparent 50%)",
        }}
      />

      <svg 
        width={size} 
        height={size} 
        className="absolute inset-0"
      >
        <circle
          cx={center}
          cy={center}
          r={200}
          fill="none"
          stroke="rgba(255,255,255,0.015)"
          strokeWidth="1"
        />

        <circle
          cx={center}
          cy={center}
          r={orbitRadius}
          fill="none"
          stroke="rgba(251,113,133,0.1)"
          strokeWidth="1"
          strokeDasharray="5 8"
        />

        <circle
          cx={center}
          cy={center}
          r={110}
          fill="none"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth="1"
        />

        {dataNodes.map((_, i) => {
          const pos = getNodePosition(i);
          const angleDeg = (i * 360) / nodeCount - 90;
          const angleRad = angleDeg * (Math.PI / 180);
          const startX = center + (centerRadius + 15) * Math.cos(angleRad);
          const startY = center + (centerRadius + 15) * Math.sin(angleRad);

          return (
            <line
              key={`line-${i}`}
              x1={startX}
              y1={startY}
              x2={pos.x}
              y2={pos.y}
              stroke="rgba(251,113,133,0.06)"
              strokeWidth="1"
            />
          );
        })}

        <defs>
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor="rgba(251,113,133,0.12)" />
            <stop offset="70%" stopColor="rgba(251,113,133,0.03)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        
        <circle
          cx={center}
          cy={center}
          r={80}
          fill="url(#centerGradient)"
        />

        <circle
          cx={center}
          cy={center}
          r={centerRadius}
          fill="rgba(10,15,25,0.95)"
          stroke="rgba(251,113,133,0.2)"
          strokeWidth="1.5"
        />

        <circle
          cx={center}
          cy={center}
          r={centerRadius - 8}
          fill="none"
          stroke="rgba(251,113,133,0.08)"
          strokeWidth="1"
        />
      </svg>

      <motion.svg
        width={size}
        height={size}
        className="absolute inset-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx={center}
          cy={center}
          r={orbitRadius}
          fill="none"
          stroke="rgba(251,113,133,0.04)"
          strokeWidth="1"
          strokeDasharray="3 15"
        />
      </motion.svg>

      <motion.div
        className="absolute rounded-full border border-red-400/20 pointer-events-none"
        style={{
          left: center - centerRadius - 8,
          top: center - centerRadius - 8,
          width: (centerRadius + 8) * 2,
          height: (centerRadius + 8) * 2,
        }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.25, 0, 0.25],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
      />

      <div
        className="absolute flex items-center justify-center z-10"
        style={{
          left: center - 20,
          top: center - 20,
          width: 40,
          height: 40,
        }}
      >
        <motion.button
          type="button"
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a0f] rounded-full p-1"
          onMouseEnter={() => setHoveredNode("center")}
          onMouseLeave={() => setHoveredNode(null)}
          onFocus={() => setHoveredNode("center")}
          onBlur={() => setHoveredNode(null)}
          title="Scattered inputs, no single source of truth"
        >
          <motion.div
            animate={{ scale: hoveredNode === "center" ? 1.08 : [1, 1.04, 1] }}
            transition={
              hoveredNode === "center"
                ? { type: "spring", stiffness: 280, damping: 28 }
                : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
            style={{
              filter: hoveredNode === "center"
                ? "drop-shadow(0 0 12px rgba(251,113,133,0.7))"
                : "drop-shadow(0 0 8px rgba(251,113,133,0.5))",
            }}
          >
            <svg 
              className="w-8 h-8 text-red-400" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </motion.div>
          <SafeAnimatePresence>
            {hoveredNode === "center" && (
              <motion.span
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ transformOrigin: "center top" }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 rounded-lg bg-slate-800/95 border border-red-500/30 text-slate-300 text-xs font-sans whitespace-nowrap z-30 shadow-xl pointer-events-none w-max max-w-[200px] text-center"
              >
              </motion.span>
            )}
          </SafeAnimatePresence>
        </motion.button>
      </div>

      {dataNodes.map((node, i) => {
        const pos = getNodePosition(i);
        const isHovered = hoveredNode === node.label;

        return (
          <motion.div
            key={node.label}
            className="absolute z-10"
            style={{
              left: pos.x,
              top: pos.y,
              x: "-50%",
              y: "-50%",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              opacity: { duration: 0.5, delay: 0.2 + i * 0.1 },
              scale: { duration: 0.5, delay: 0.2 + i * 0.1 },
            }}
          >
            <motion.button
              type="button"
              className="group relative rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a0f]"
              onMouseEnter={() => setHoveredNode(node.label)}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setHoveredNode(node.label)}
              onBlur={() => setHoveredNode(null)}
              title={node.tooltip}
            >
              <motion.div
                animate={{ y: isHovered ? 0 : [0, -5, 0] }}
                transition={
                  isHovered
                    ? { type: "spring", stiffness: 280, damping: 28 }
                    : { duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }
                }
              >
                <motion.div
                  className="relative px-4 py-2.5 rounded-full"
                  animate={{ scale: isHovered ? 1.03 : 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                >
                  <div className="absolute inset-0 rounded-full bg-slate-900/90 backdrop-blur-md" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.04] to-transparent" />
                  <div
                    className="absolute inset-0 rounded-full border transition-colors duration-300"
                    style={{
                      borderColor: isHovered ? "rgba(251,113,133,0.4)" : "rgba(255,255,255,0.07)",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full transition-opacity duration-300"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      boxShadow: "0 0 20px rgba(251,113,133,0.2)",
                    }}
                  />
                  <span className="relative z-10 text-[12px] font-medium text-slate-200 whitespace-nowrap font-orbitron tracking-wide block text-center">
                    {node.label}
                  </span>
                </motion.div>
              </motion.div>
              <SafeAnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ transformOrigin: "center bottom" }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-lg bg-slate-800/95 border border-red-500/30 text-slate-300 text-xs font-sans whitespace-nowrap z-30 shadow-xl pointer-events-none"
                  >
                    {node.tooltip}
                  </motion.span>
                )}
              </SafeAnimatePresence>
            </motion.button>
          </motion.div>
        );
      })}

      {dataNodes.map((_, i) => {
        const pos = getNodePosition(i);
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-3 h-3 rounded-full pointer-events-none z-20"
            style={{
              background: "radial-gradient(circle, rgba(251,113,133,1) 0%, rgba(251,113,133,0.4) 50%, transparent 100%)",
              boxShadow: "0 0 12px 4px rgba(251,113,133,0.6), 0 0 24px 8px rgba(251,113,133,0.3)",
            }}
            initial={{
              left: pos.x - 6,
              top: pos.y - 6,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              left: [pos.x - 6, center - 6],
              top: [pos.y - 6, center - 6],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
              times: [0, 0.2, 0.8, 1],
            }}
          />
        );
      })}
      </div>
    </div>
  );
}
