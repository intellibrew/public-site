"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FC, PropsWithChildren } from "react";

const SafeAnimatePresence = AnimatePresence as FC<PropsWithChildren>;

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

type IntroducingSectionProps = {
  embedded?: boolean;
};

export function IntroducingSection({ embedded = false }: IntroducingSectionProps) {
  return (
    <section
      id="solution"
      className={
        embedded
          ? "factory-scroll-panel factory-scroll-panel--solution relative h-full overflow-hidden"
          : "relative bg-[rgba(8,10,15,0.88)] py-24 overflow-hidden"
      }
    >
      {!embedded && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 55%)",
          }}
        />
      )}

      <div
        className={`mx-auto max-w-6xl px-6 relative z-10 ${
          embedded
            ? "flex h-full max-h-full flex-col justify-center overflow-y-auto py-[calc(var(--site-header-total)+0.75rem)] [scrollbar-width:thin]"
            : ""
        }`}
        {...(embedded ? { "data-lenis-prevent": true } : {})}
      >
        <motion.div
          className="flex justify-center mb-6"
          initial={embedded ? false : { opacity: 0, y: 20 }}
          whileInView={embedded ? undefined : { opacity: 1, y: 0 }}
          viewport={embedded ? undefined : { once: true }}
          transition={embedded ? undefined : { duration: 0.5 }}
        >
          <span className="shiny-badge">Solution</span>
        </motion.div>

        <motion.h2
          className="text-center text-heading mb-4 font-fragment"
          initial={embedded ? false : { opacity: 0, y: 20 }}
          whileInView={embedded ? undefined : { opacity: 1, y: 0 }}
          viewport={embedded ? undefined : { once: true }}
          transition={embedded ? undefined : { duration: 0.5, delay: 0.1 }}
        >
          Intelligence for <span className="text-primary">Factories</span>
        </motion.h2>

        <motion.p
          className={`text-center text-body ${embedded ? "mb-8" : "mb-16"}`}
          initial={embedded ? false : { opacity: 0, y: 20 }}
          whileInView={embedded ? undefined : { opacity: 1, y: 0 }}
          viewport={embedded ? undefined : { once: true }}
          transition={embedded ? undefined : { duration: 0.5, delay: 0.2 }}
        >
          One platform. Complete automation. From inputs to a full production line model.
        </motion.p>

        <motion.div
          initial={embedded ? false : { opacity: 0 }}
          whileInView={embedded ? undefined : { opacity: 1 }}
          viewport={embedded ? undefined : { once: true }}
          transition={embedded ? undefined : { duration: 0.8, delay: 0.3 }}
        >
          <FlowDiagram />
        </motion.div>
      </div>
    </section>
  );
}

const DESIGN_WIDTH = 900;
const DESIGN_HEIGHT = 320;

const MOBILE_WIDTH = 340;
const MOBILE_HEIGHT = 500;

function useIsNarrowLayout() {
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsNarrow(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isNarrow;
}

function FlowingDot({ pathId, delay, duration }: { pathId: string; delay: number; duration: number }) {
  const [dot, setDot] = useState({ x: 0, y: 0, opacity: 0 });

  useEffect(() => {
    const path = document.getElementById(pathId) as SVGPathElement | null;
    if (!path) return;

    const pathLength = path.getTotalLength();
    let animationId = 0;
    let startTime: number | null = null;
    let lastDrawTime = 0;
    let lastDot = { x: 0, y: 0, opacity: 0 };
    let isNearViewport = !path.closest("section");
    const totalCycle = (delay + duration) * 1000;
    const minFrameMs = 1000 / 30;

    const section = path.closest("section");
    const stop = () => {
      if (!animationId) return;
      cancelAnimationFrame(animationId);
      animationId = 0;
    };
    const start = () => {
      if (animationId || !isNearViewport || document.visibilityState !== "visible") return;
      animationId = requestAnimationFrame(animate);
    };
    const observer = section
      ? new IntersectionObserver(
          ([entry]) => {
            isNearViewport = entry.isIntersecting;
            if (isNearViewport) {
              start();
            } else {
              stop();
            }
          },
          { rootMargin: "160px" }
        )
      : null;
    if (section && observer) observer.observe(section);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      animationId = 0;
      if (!isNearViewport || document.visibilityState !== "visible") return;
      if (timestamp - lastDrawTime < minFrameMs) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      lastDrawTime = timestamp;

      const elapsed = (timestamp - startTime) % totalCycle;
      let nextDot = { ...lastDot, opacity: 0 };

      if (elapsed < delay * 1000) {
        nextDot = { ...lastDot, opacity: 0 };
      } else {
        const progress = (elapsed - delay * 1000) / (duration * 1000);
        if (progress <= 1) {
          const point = path.getPointAtLength(progress * pathLength);
          let opacity = 1;
          if (progress < 0.15) {
            opacity = progress / 0.15;
          } else if (progress > 0.85) {
            opacity = (1 - progress) / 0.15;
          }
          nextDot = { x: point.x, y: point.y, opacity };
        }
      }

      if (
        Math.abs(nextDot.x - lastDot.x) > 0.25 ||
        Math.abs(nextDot.y - lastDot.y) > 0.25 ||
        Math.abs(nextDot.opacity - lastDot.opacity) > 0.02
      ) {
        lastDot = nextDot;
        setDot(nextDot);
      }

      animationId = requestAnimationFrame(animate);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        stop();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    start();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [pathId, delay, duration]);

  return (
    <g>
      <circle
        cx={dot.x}
        cy={dot.y}
        r="12"
        fill="rgba(20,184,166,0.4)"
        style={{ opacity: dot.opacity * 0.7 }}
      />
      <circle
        cx={dot.x}
        cy={dot.y}
        r="5"
        fill="rgba(153,246,228,1)"
        style={{
          opacity: dot.opacity,
          filter: "drop-shadow(0 0 6px rgba(94,234,212,1))",
        }}
      />
    </g>
  );
}

type FlowNodeProps = {
  label: string;
  tooltip: string;
  nodeKey: string;
  hoveredNode: string | null;
  setHoveredNode: (key: string | null) => void;
  className?: string;
  labelClassName?: string;
  initial?: { opacity: number; x?: number; y?: number };
  animateTo?: { opacity: number; x?: number; y?: number };
  transition?: { duration: number; delay?: number };
};

function FlowNodeButton({
  label,
  tooltip,
  nodeKey,
  hoveredNode,
  setHoveredNode,
  className = "",
  labelClassName = "text-[13px] font-body text-slate-300 tracking-wide block px-5 py-3",
  initial,
  animateTo,
  transition,
}: FlowNodeProps) {
  const isHovered = hoveredNode === nodeKey;

  return (
    <motion.button
      type="button"
      initial={initial}
      whileInView={animateTo}
      viewport={{ once: true }}
      transition={transition}
      onMouseEnter={() => setHoveredNode(nodeKey)}
      onMouseLeave={() => setHoveredNode(null)}
      onFocus={() => setHoveredNode(nodeKey)}
      onBlur={() => setHoveredNode(null)}
      className={`group relative rounded-full border bg-black/40 backdrop-blur-sm text-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f18] ${className}`}
      title={tooltip}
      style={{
        borderColor: isHovered ? "rgba(20,184,166,0.7)" : "rgba(20,184,166,0.3)",
        boxShadow: isHovered ? "0 0 20px rgba(20,184,166,0.35)" : "none",
      }}
    >
      <motion.span
        className={labelClassName}
        animate={{ scale: isHovered ? 1.03 : 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
      >
        {label}
      </motion.span>
      <SafeAnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformOrigin: "center bottom" }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-lg bg-black/95 border border-teal-500/30 text-slate-200 text-xs font-body whitespace-nowrap z-[100] shadow-xl pointer-events-none"
          >
            {tooltip}
          </motion.span>
        )}
      </SafeAnimatePresence>
    </motion.button>
  );
}

function FlowDiagramShell({
  width,
  height,
  children,
  progressDirection = "horizontal",
}: {
  width: number;
  height: number;
  children: ReactNode;
  progressDirection?: "horizontal" | "vertical";
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-full rounded-2xl border border-teal-500/20 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(10,10,12,0.98) 0%, rgba(4,4,6,0.99) 100%)",
        width,
        maxWidth: "100%",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="relative overflow-hidden rounded-2xl" style={{ width, height }}>
        {children}
        <div
          className={`absolute overflow-hidden ${
            progressDirection === "vertical"
              ? "left-0 top-0 bottom-0 w-[2px]"
              : "bottom-0 left-0 right-0 h-[2px]"
          }`}
        >
          <motion.div
            className={progressDirection === "vertical" ? "h-1/5 w-full" : "h-full w-1/5"}
            style={{
              background:
                progressDirection === "vertical"
                  ? "linear-gradient(180deg, transparent, rgba(20,184,166,1), transparent)"
                  : "linear-gradient(90deg, transparent, rgba(20,184,166,1), transparent)",
              boxShadow: "0 0 15px rgba(20,184,166,0.7)",
            }}
            animate={progressDirection === "vertical" ? { y: ["-20%", "600%"] } : { x: ["-20%", "600%"] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function NeoFabHub({ className = "" }: { className?: string }) {
  return (
    <motion.button
      type="button"
      className={`relative cursor-default rounded-full focus:outline-none ${className}`}
      title=""
    >
      <div
        className="absolute inset-[-28px] rounded-full pointer-events-none md:inset-[-35px]"
        style={{
          background: "radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-[-14px] rounded-full border border-teal-500/40 pointer-events-none md:inset-[-18px]" />
      <div
        className="relative rounded-full border border-teal-400/60 px-6 py-3 md:px-7 md:py-4"
        style={{
          background: "linear-gradient(180deg, rgba(13,148,136,0.95) 0%, rgba(19,78,74,0.98) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <span className="text-[13px] font-orbitron text-teal-50 tracking-wider md:text-[14px]">NeoFab AI</span>
      </div>
    </motion.button>
  );
}

function FlowDiagramVertical() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const updateScale = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      setScale(Math.min(1, wrapper.clientWidth / MOBILE_WIDTH));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const centerX = MOBILE_WIDTH / 2;
  const centerY = 214;
  const inputY = 88;
  const inputNodes = inputs.map((input, i) => ({
    ...input,
    x: [62, centerX, 278][i],
    y: inputY,
  }));
  const outputNodes = [
    { ...outputs[0], x: 88, y: 312 },
    { ...outputs[1], x: 252, y: 312 },
    { ...outputs[2], x: 88, y: 360 },
    { ...outputs[3], x: 252, y: 360 },
    { ...outputs[4], x: centerX, y: 418 },
  ];

  const inputPaths = inputNodes.map((node, i) => ({
    id: `path-v-in-${i}`,
    d: `M ${node.x} ${node.y + 20} Q ${node.x} ${(node.y + centerY) / 2 + 24}, ${centerX} ${centerY - 26}`,
  }));

  const outputPaths = outputNodes.map((node, i) => ({
    id: `path-v-out-${i}`,
    d: `M ${centerX} ${centerY + 26} Q ${centerX} ${(centerY + node.y) / 2 + 12}, ${node.x} ${node.y - 18}`,
  }));

  return (
    <div
      ref={wrapperRef}
      className="mx-auto w-full"
      style={{
        maxWidth: MOBILE_WIDTH,
        height: MOBILE_HEIGHT * scale,
      }}
    >
      <div
        style={{
          width: MOBILE_WIDTH,
          height: MOBILE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
    <FlowDiagramShell width={MOBILE_WIDTH} height={MOBILE_HEIGHT} progressDirection="vertical">
      <svg
        className="absolute inset-0 pointer-events-none"
        width={MOBILE_WIDTH}
        height={MOBILE_HEIGHT}
        viewBox={`0 0 ${MOBILE_WIDTH} ${MOBILE_HEIGHT}`}
      >
        {inputPaths.map((path) => (
          <path
            key={path.id}
            id={path.id}
            d={path.d}
            fill="none"
            stroke="rgba(45,212,191,0.25)"
            strokeWidth="1.5"
          />
        ))}
        {outputPaths.map((path) => (
          <path
            key={path.id}
            id={path.id}
            d={path.d}
            fill="none"
            stroke="rgba(45,212,191,0.25)"
            strokeWidth="1.5"
          />
        ))}

        <FlowingDot pathId="path-v-in-0" delay={0} duration={2.8} />
        <FlowingDot pathId="path-v-in-1" delay={0.9} duration={2.8} />
        <FlowingDot pathId="path-v-in-2" delay={1.8} duration={2.8} />
        <FlowingDot pathId="path-v-out-0" delay={3} duration={2.4} />
        <FlowingDot pathId="path-v-out-1" delay={3.3} duration={2.4} />
        <FlowingDot pathId="path-v-out-2" delay={3.6} duration={2.4} />
        <FlowingDot pathId="path-v-out-3" delay={3.9} duration={2.4} />
        <FlowingDot pathId="path-v-out-4" delay={4.2} duration={2.4} />
      </svg>

      <p className="absolute left-1/2 top-5 z-10 -translate-x-1/2 text-[10px] font-body uppercase tracking-widest text-slate-500">
        Inputs
      </p>

      {inputNodes.map((input, i) => (
        <div
          key={input.label}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: input.x, top: input.y }}
        >
          <FlowNodeButton
            label={input.label}
            tooltip={input.tooltip}
            nodeKey={`input-${input.label}`}
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
            labelClassName="text-[11px] font-body text-slate-300 tracking-wide block px-3 py-2.5 whitespace-nowrap"
            initial={{ opacity: 0, y: -12 }}
            animateTo={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
          />
        </div>
      ))}

      <div
        className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ left: centerX, top: centerY }}
      >
        <NeoFabHub />
      </div>

      <p className="absolute left-1/2 top-[286px] z-10 -translate-x-1/2 text-[10px] font-body uppercase tracking-widest text-teal-400">
        Outputs
      </p>

      {outputNodes.map((output, i) => (
        <div
          key={output.label}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: output.x, top: output.y }}
        >
          <FlowNodeButton
            label={output.label}
            tooltip={output.tooltip}
            nodeKey={`output-${output.label}`}
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
            labelClassName="text-[11px] font-body text-teal-200 tracking-wide block px-3 py-2 text-center whitespace-nowrap"
            initial={{ opacity: 0, y: 12 }}
            animateTo={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
          />
        </div>
      ))}
    </FlowDiagramShell>
      </div>
    </div>
  );
}

function FlowDiagramHorizontal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: DESIGN_WIDTH, height: DESIGN_HEIGHT });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width > 0 ? rect.width : DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
      });
    };

    updateDimensions();
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(element);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) updateDimensions();
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(element);

    window.addEventListener("resize", updateDimensions);
    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
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
      className="relative mx-auto w-full rounded-2xl border border-teal-500/20 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(10,10,12,0.98) 0%, rgba(4,4,6,0.99) 100%)",
        maxWidth: DESIGN_WIDTH,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="relative overflow-hidden rounded-2xl p-8" style={{ minHeight: DESIGN_HEIGHT }}>
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          {inputPaths.map((path) => (
            <path
              key={path.id}
              id={path.id}
              d={path.d}
              fill="none"
              stroke="rgba(45,212,191,0.25)"
              strokeWidth="1.5"
            />
          ))}

          {outputPaths.map((path) => (
            <path
              key={path.id}
              id={path.id}
              d={path.d}
              fill="none"
              stroke="rgba(45,212,191,0.25)"
              strokeWidth="1.5"
            />
          ))}

          <FlowingDot pathId="path-in-0" delay={0} duration={3} />
          <FlowingDot pathId="path-in-1" delay={1} duration={3} />
          <FlowingDot pathId="path-in-2" delay={2} duration={3} />
          <FlowingDot pathId="path-out-0" delay={3.2} duration={2.6} />
          <FlowingDot pathId="path-out-1" delay={3.5} duration={2.6} />
          <FlowingDot pathId="path-out-2" delay={3.8} duration={2.6} />
          <FlowingDot pathId="path-out-3" delay={4.1} duration={2.6} />
          <FlowingDot pathId="path-out-4" delay={4.4} duration={2.6} />
        </svg>

        <div className="relative z-10 flex min-h-[260px] items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-body uppercase tracking-widest text-slate-500">
              <span className="[writing-mode:vertical-lr] rotate-180">Inputs</span>
            </div>
            <div className="flex w-[130px] flex-col gap-5">
              {inputs.map((input, i) => (
                <FlowNodeButton
                  key={input.label}
                  label={input.label}
                  tooltip={input.tooltip}
                  nodeKey={`input-${input.label}`}
                  hoveredNode={hoveredNode}
                  setHoveredNode={setHoveredNode}
                  className="w-full text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animateTo={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-1 justify-center px-4">
            <NeoFabHub />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex w-[140px] flex-col gap-2.5">
              {outputs.map((output, i) => (
                <FlowNodeButton
                  key={output.label}
                  label={output.label}
                  tooltip={output.tooltip}
                  nodeKey={`output-${output.label}`}
                  hoveredNode={hoveredNode}
                  setHoveredNode={setHoveredNode}
                  className="w-full"
                  labelClassName="text-[11px] font-body text-teal-200 tracking-wide block px-4 py-2 text-center"
                  initial={{ opacity: 0, x: 20 }}
                  animateTo={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                />
              ))}
            </div>
            <div className="text-[10px] font-body uppercase tracking-widest text-teal-400">
              <span className="[writing-mode:vertical-lr]">Outputs</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <motion.div
            className="h-full w-1/5"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(20,184,166,1), transparent)",
              boxShadow: "0 0 15px rgba(20,184,166,0.7)",
            }}
            animate={{ x: ["-20%", "600%"] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function FlowDiagram() {
  const isNarrow = useIsNarrowLayout();
  return isNarrow ? <FlowDiagramVertical /> : <FlowDiagramHorizontal />;
}
