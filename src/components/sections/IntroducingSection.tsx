"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const inputs = [
  { label: "CAD", tooltip: "Design files and drawings" },
  { label: "BOM", tooltip: "Bill of materials" },
  { label: "Specs", tooltip: "Technical specifications" },
];
const outputs = [
  { label: "Layout", tooltip: "Production-ready layout" },
  { label: "Stations", tooltip: "Workstation configuration" },
  { label: "RFQ Pack", tooltip: "RFQ-ready documents" },
  { label: "CAPEX/OPEX", tooltip: "Cost and utilization" },
  { label: "Simulation", tooltip: "Throughput and scenarios" },
];

export function IntroducingSection() {
  return (
    <section id="solution" className="relative bg-[#080a0f] py-24 overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 50%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="shiny-badge">
            Introducing
          </span>
        </motion.div>

        <motion.h2 
          className="text-center font-orbitron text-[32px] md:text-[48px] leading-tight text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          AI Intelligence for Factories
        </motion.h2>

        <motion.p 
          className="text-center text-slate-400 text-lg mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          One platform. Complete automation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <FlowDiagram />
        </motion.div>
      </div>
    </section>
  );
}

function FlowingDot({ pathId, delay, duration }: { pathId: string; delay: number; duration: number }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const path = document.getElementById(pathId) as SVGPathElement | null;
    if (!path) return;

    const pathLength = path.getTotalLength();
    let animationId: number;
    let startTime: number | null = null;
    const totalCycle = (delay + duration) * 1000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % totalCycle;
      
      if (elapsed < delay * 1000) {
        setOpacity(0);
      } else {
        const progress = (elapsed - delay * 1000) / (duration * 1000);
        if (progress <= 1) {
          const point = path.getPointAtLength(progress * pathLength);
          setPosition({ x: point.x, y: point.y });
          
          if (progress < 0.15) {
            setOpacity(progress / 0.15);
          } else if (progress > 0.85) {
            setOpacity((1 - progress) / 0.15);
          } else {
            setOpacity(1);
          }
        } else {
          setOpacity(0);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [pathId, delay, duration]);

  return (
    <g>
      <circle
        cx={position.x}
        cy={position.y}
        r="12"
        fill="rgba(59,130,246,0.4)"
        style={{ opacity: opacity * 0.7 }}
      />
      <circle
        cx={position.x}
        cy={position.y}
        r="5"
        fill="rgba(140,200,255,1)"
        style={{
          opacity,
          filter: "drop-shadow(0 0 6px rgba(100,180,255,1))",
        }}
      />
    </g>
  );
}

function FlowDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 320 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const padding = 32;
  const contentHeight = dimensions.height - padding * 2;
  
  const inputPillHeight = 46;
  const inputGap = 20;
  const inputTotalHeight = 3 * inputPillHeight + 2 * inputGap;
  const inputStartY = padding + (contentHeight - inputTotalHeight) / 2;
  const inputY = [
    inputStartY + inputPillHeight / 2,
    inputStartY + inputPillHeight + inputGap + inputPillHeight / 2,
    inputStartY + 2 * (inputPillHeight + inputGap) + inputPillHeight / 2,
  ];
  
  const outputPillHeight = 38;
  const outputGap = 10;
  const outputTotalHeight = 5 * outputPillHeight + 4 * outputGap;
  const outputStartY = padding + (contentHeight - outputTotalHeight) / 2;
  const outputY = [
    outputStartY + outputPillHeight / 2,
    outputStartY + (outputPillHeight + outputGap) + outputPillHeight / 2,
    outputStartY + 2 * (outputPillHeight + outputGap) + outputPillHeight / 2,
    outputStartY + 3 * (outputPillHeight + outputGap) + outputPillHeight / 2,
    outputStartY + 4 * (outputPillHeight + outputGap) + outputPillHeight / 2,
  ];

  const inputLabelWidth = 20;
  const outputLabelWidth = 20;
  const inputX = padding + inputLabelWidth + 16 + 130;
  const outputX = dimensions.width - padding - outputLabelWidth - 16 - 140;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const inputPaths = inputY.map((y, i) => ({
    id: `path-in-${i}`,
    d: `M ${inputX} ${y} Q ${(inputX + centerX) / 2} ${y}, ${centerX} ${centerY}`,
  }));

  const outputPaths = outputY.map((y, i) => ({
    id: `path-out-${i}`,
    d: `M ${centerX} ${centerY} Q ${(centerX + outputX) / 2} ${y}, ${outputX} ${y}`,
  }));

  return (
    <div 
      ref={containerRef}
      className="relative mx-auto rounded-2xl border border-blue-500/20 overflow-visible"
      style={{
        background: "linear-gradient(180deg, rgba(10,15,30,0.9) 0%, rgba(5,10,20,0.95) 100%)",
        maxWidth: 900,
        boxShadow: "0 0 60px rgba(59,130,246,0.15), 0 0 100px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="relative p-8 overflow-visible rounded-2xl">

        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          {inputPaths.map((path) => (
            <path
              key={path.id}
              id={path.id}
              d={path.d}
              fill="none"
              stroke="rgba(80,130,220,0.25)"
              strokeWidth="1.5"
            />
          ))}

          {outputPaths.map((path) => (
            <path
              key={path.id}
              id={path.id}
              d={path.d}
              fill="none"
              stroke="rgba(80,130,220,0.25)"
              strokeWidth="1.5"
            />
          ))}


          <FlowingDot pathId="path-in-0" delay={0} duration={1.8} />
          <FlowingDot pathId="path-in-1" delay={0.6} duration={1.8} />
          <FlowingDot pathId="path-in-2" delay={1.2} duration={1.8} />

          <FlowingDot pathId="path-out-0" delay={2.0} duration={1.5} />
          <FlowingDot pathId="path-out-1" delay={2.2} duration={1.5} />
          <FlowingDot pathId="path-out-2" delay={2.4} duration={1.5} />
          <FlowingDot pathId="path-out-3" delay={2.6} duration={1.5} />
          <FlowingDot pathId="path-out-4" delay={2.8} duration={1.5} />
        </svg>

        <div className="relative z-10 flex items-center justify-between min-h-[260px]">
          
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-orbitron tracking-widest text-slate-500 uppercase writing-mode-vertical">
              <span className="[writing-mode:vertical-lr] rotate-180">Inputs</span>
            </div>
            <div className="flex flex-col gap-5 w-[130px]">
              {inputs.map((input, i) => {
                const isHovered = hoveredNode === `input-${input.label}`;
                return (
                  <motion.button
                    key={input.label}
                    type="button"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    onMouseEnter={() => setHoveredNode(`input-${input.label}`)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onFocus={() => setHoveredNode(`input-${input.label}`)}
                    onBlur={() => setHoveredNode(null)}
                    className="group relative text-left w-full rounded-full border bg-slate-900/80 backdrop-blur-sm text-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f18]"
                    title={input.tooltip}
                    style={{
                      borderColor: isHovered ? "rgba(59,130,246,0.7)" : "rgba(59,130,246,0.3)",
                      boxShadow: isHovered ? "0 0 20px rgba(59,130,246,0.35)" : "none",
                    }}
                  >
                    <motion.span
                      className="text-[13px] font-orbitron text-slate-300 tracking-wide block px-5 py-3"
                      animate={{ scale: isHovered ? 1.03 : 1 }}
                      transition={{ type: "spring", stiffness: 280, damping: 28 }}
                    >
                      {input.label}
                    </motion.span>
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                          style={{ transformOrigin: "center bottom" }}
                          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-lg bg-slate-800/95 border border-blue-500/30 text-slate-300 text-xs font-sans whitespace-nowrap z-20 shadow-xl pointer-events-none"
                        >
                          {input.tooltip}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <motion.button
              type="button"
              animate={{ scale: hoveredNode === "line-model" ? 1.05 : [1, 1.02, 1] }}
              transition={
                hoveredNode === "line-model"
                  ? { type: "spring", stiffness: 280, damping: 28 }
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }
              className="relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f18] rounded-full"
              onMouseEnter={() => setHoveredNode("line-model")}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setHoveredNode("line-model")}
              onBlur={() => setHoveredNode(null)}
              title=""
            >
              <div 
                className="absolute inset-[-35px] rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
                  opacity: hoveredNode === "line-model" ? 1.2 : 1,
                }}
              />
              
              <motion.div
                className="absolute inset-[-18px] rounded-full border border-blue-500/40 pointer-events-none"
                animate={
                  hoveredNode === "line-model"
                    ? { scale: 1.2, opacity: 0.8 }
                    : { scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }
                }
                transition={
                  hoveredNode === "line-model"
                    ? { type: "spring", stiffness: 300, damping: 20 }
                    : { duration: 3, repeat: Infinity, ease: "easeOut" }
                }
              />
              
              <div 
                className="relative px-7 py-4 rounded-full border border-blue-400/60"
                style={{
                  background: "linear-gradient(180deg, rgba(45,90,180,0.95) 0%, rgba(30,60,120,0.98) 100%)",
                  boxShadow:
                    hoveredNode === "line-model"
                      ? "0 0 60px rgba(59,130,246,0.7), inset 0 1px 0 rgba(255,255,255,0.2)"
                      : "0 0 50px rgba(59,130,246,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <span className="text-[14px] font-orbitron text-blue-50 tracking-wider">
                  Line Model
                </span>
              </div>
              <AnimatePresence>
                {hoveredNode === "line-model" && (
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ transformOrigin: "center bottom" }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-lg bg-slate-800/95 border border-blue-500/30 text-slate-300 text-xs font-sans whitespace-nowrap z-20 shadow-xl pointer-events-none"
                  >
                    
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2.5 w-[140px]">
              {outputs.map((output, i) => {
                const isHovered = hoveredNode === `output-${output.label}`;
                return (
                  <motion.button
                    key={output.label}
                    type="button"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                    onMouseEnter={() => setHoveredNode(`output-${output.label}`)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onFocus={() => setHoveredNode(`output-${output.label}`)}
                    onBlur={() => setHoveredNode(null)}
                    className="group relative w-full rounded-full border bg-blue-950/70 backdrop-blur-sm text-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f18]"
                    title={output.tooltip}
                    style={{
                      borderColor: isHovered ? "rgba(59,130,246,0.8)" : "rgba(59,130,246,0.4)",
                      boxShadow: isHovered ? "0 0 20px rgba(59,130,246,0.35)" : "none",
                    }}
                  >
                    <motion.span
                      className="text-[11px] font-orbitron text-blue-200 tracking-wide block px-4 py-2 text-center"
                      animate={{ scale: isHovered ? 1.03 : 1 }}
                      transition={{ type: "spring", stiffness: 280, damping: 28 }}
                    >
                      {output.label}
                    </motion.span>
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                          style={{ transformOrigin: "center bottom" }}
                          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-lg bg-slate-800/95 border border-blue-500/30 text-slate-300 text-xs font-sans whitespace-nowrap z-20 shadow-xl pointer-events-none"
                        >
                          {output.tooltip}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
            <div className="text-[10px] font-orbitron tracking-widest text-blue-400 uppercase">
              <span className="[writing-mode:vertical-lr]">Outputs</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <motion.div
            className="h-full w-1/5"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(59,130,246,1), transparent)",
              boxShadow: "0 0 15px rgba(59,130,246,0.7)",
            }}
            animate={{ x: ["-20%", "600%"] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
