"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Settings, Hammer, Activity } from "lucide-react";

const products = [
  {
    id: "fabplan",
    label: "FabPlan",
    icon: Settings,
    title: "Design the line model from CAD + BOM.",
    description: "Convert CAD/BOM/specs into stations, takt, and an editable layout in hours.",
    stat: "2 hours",
    statLabel: "First pass line model",
    caption: "CAD / BOM → Stations → Layout",
    video: "/neofab (2).mp4",
  },
  {
    id: "anvil",
    label: "Anvil",
    icon: Hammer,
    title: "Setup your factory with RFQs and equipment packs.",
    description: "Turn the line model into machine specs, supplier shortlists, and RFQ-ready documents.",
    stat: "2-3 days",
    statLabel: "RFQ pack generation",
    caption: "Specs → RFQ Pack → Vendor Options",
    video: "/anvil.mp4",
  },
  {
    id: "centor",
    label: "CenTor",
    icon: Activity,
    title: "Simulate operations. Find bottlenecks before you build.",
    description: "Model throughput, WIP, constraints, and the impact of changes across stations.",
    stat: "10-30%",
    statLabel: "Throughput uplift",
    caption: "Throughput → Bottlenecks → Scenarios",
    video: "/centor.mp4",
  },
];

export function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const product0Active = useTransform(scrollYProgress, [0, 0.28, 0.35], [1, 1, 0]);
  const product1Active = useTransform(scrollYProgress, [0.28, 0.35, 0.63, 0.7], [0, 1, 1, 0]);
  const product2Active = useTransform(scrollYProgress, [0.63, 0.7, 1], [0, 1, 1]);

  const product0Y = useTransform(scrollYProgress, [0, 0.25, 0.4], [0, 0, 24]);
  const product1Y = useTransform(scrollYProgress, [0.2, 0.35, 0.5, 0.65], [24, 0, 0, 24]);
  const product2Y = useTransform(scrollYProgress, [0.5, 0.65, 0.85, 1], [24, 0, 0, 12]);

  const part0Opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.22]);
  const part1Opacity = useTransform(scrollYProgress, [0.28, 0.35, 0.63, 0.7], [0.22, 1, 1, 0.22]);
  const part2Opacity = useTransform(scrollYProgress, [0.63, 0.7, 1], [0.22, 1, 1]);
  const desc0Opacity = useTransform(scrollYProgress, [0, 0.28, 0.38], [1, 1, 0.3]);
  const desc1Opacity = useTransform(scrollYProgress, [0.25, 0.35, 0.6, 0.72], [0.3, 1, 1, 0.3]);
  const desc2Opacity = useTransform(scrollYProgress, [0.6, 0.7, 0.9, 1], [0.3, 1, 1, 0.35]);
  const active0 = useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 1, 0]);
  const active1 = useTransform(scrollYProgress, [0.2, 0.32, 0.58, 0.72], [0, 1, 1, 0]);
  const active2 = useTransform(scrollYProgress, [0.55, 0.68, 0.88, 1], [0, 1, 1, 0.98]);

  const buttonScaleTransforms = [
    useTransform(active0, (v) => 0.98 + v * 0.04),
    useTransform(active1, (v) => 0.98 + v * 0.04),
    useTransform(active2, (v) => 0.98 + v * 0.04),
  ];

  const bulletScaleTransforms = [
    useTransform(product0Active, (v) => 0.8 + v * 0.45),
    useTransform(product1Active, (v) => 0.8 + v * 0.45),
    useTransform(product2Active, (v) => 0.8 + v * 0.45),
  ];

  const labelFontSizeTransforms = [
    useTransform(product0Active, (v) => `${20 + v * 8}px`),
    useTransform(product1Active, (v) => `${20 + v * 8}px`),
    useTransform(product2Active, (v) => `${20 + v * 8}px`),
  ];

  const labelTextShadowTransforms = [
    useTransform(product0Active, (v) =>
      v > 0.8 ? "0 2px 20px rgba(255,255,255,0.35)" : "0 1px 15px rgba(255,255,255,0.2)"
    ),
    useTransform(product1Active, (v) =>
      v > 0.8 ? "0 2px 20px rgba(255,255,255,0.35)" : "0 1px 15px rgba(255,255,255,0.2)"
    ),
    useTransform(product2Active, (v) =>
      v > 0.8 ? "0 2px 20px rgba(255,255,255,0.35)" : "0 1px 15px rgba(255,255,255,0.2)"
    ),
  ];

  const descFontSizeTransforms = [
    useTransform(active0, (v) => `${15 + v * 3}px`),
    useTransform(active1, (v) => `${15 + v * 3}px`),
    useTransform(active2, (v) => `${15 + v * 3}px`),
  ];

  const cardGlowBoxShadowTransforms = [
    useTransform(active0, (v) =>
      v > 0.5 ? "0 4px 24px rgba(59, 130, 246, 0.15)" : "none"
    ),
    useTransform(active1, (v) =>
      v > 0.5 ? "0 4px 24px rgba(59, 130, 246, 0.15)" : "none"
    ),
    useTransform(active2, (v) =>
      v > 0.5 ? "0 4px 24px rgba(59, 130, 246, 0.15)" : "none"
    ),
  ];

  const scrollToProduct = (i: number) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = sectionRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollableDistance = sectionHeight - viewportHeight;
    const targetProgress = 0.2 + i * 0.35;
    const targetScroll = Math.max(
      0,
      sectionTop + targetProgress * Math.max(0, scrollableDistance) - viewportHeight * 0.2
    );
    const lenis = window.lenis;
    if (lenis) {
      lenis.scrollTo(targetScroll, { duration: 1.5 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="products"
      className="relative bg-[#080a0f] min-h-[100vh] md:min-h-[300vh]"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 50%)",
        }}
      />

      {/* Mobile layout */}
      <div className="md:hidden relative mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 space-y-8">
        <div className="text-center mb-2">
          <span className="shiny-badge">Our Products</span>
          <h2 className="font-orbitron text-[22px] leading-tight text-white mt-3 mb-1">
            NeoFab turns inputs into a complete line model.
          </h2>
          <p className="text-body">Three modules. One Factory Output.</p>
        </div>

        <div className="space-y-10">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl bg-[#050816] border border-blue-500/25 shadow-[0_18px_60px_rgba(15,23,42,0.9)] overflow-hidden"
            >
              <div className="px-5 pt-6 pb-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/40 text-sky-300">
                    <product.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[20px] leading-snug font-orbitron text-white">
                      {product.label}
                    </h3>
                    <p className="mt-1 text-[13px] text-slate-300">
                      {product.title}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-blue-500/40 bg-blue-500/15 px-4 py-3">
                    <p className="text-[22px] font-orbitron text-sky-300 leading-none">
                      {product.stat}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-300 uppercase tracking-[0.14em]">
                      {product.statLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <video
                  className="w-full aspect-[4/3] object-cover object-top"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={product.video} type="video/mp4" />
                </video>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-sm border border-blue-500/30 whitespace-nowrap">
                    <span className="text-slate-200 text-xs font-orbitron tracking-wide">
                      {product.caption}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop / tablet scroll experience */}
      <div className="hidden md:block sticky top-0 h-screen flex flex-col overflow-hidden pt-[70px]">
        <div
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 flex-1 flex flex-col min-h-0 py-8 md:py-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="text-center mb-6 md:mb-8 shrink-0">
            <span className="shiny-badge">Our Products</span>
            <h2 className="font-orbitron text-[22px] md:text-[36px] leading-tight text-white mt-3 md:mt-5 mb-1">
              NeoFab turns inputs into a complete line model.
            </h2>
            <p className="text-body">Three modules. One Factory Output.</p>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-12 min-h-0">
            <div className="flex flex-col gap-4 md:gap-6 md:min-w-[320px] md:max-w-[420px] shrink-0">
              {products.map((product, i) => {
                const opacityTransform =
                  i === 0 ? part0Opacity : i === 1 ? part1Opacity : part2Opacity;
                const activeTransform =
                  i === 0 ? product0Active : i === 1 ? product1Active : product2Active;
                const activeEmphasis =
                  i === 0 ? active0 : i === 1 ? active1 : active2;
                return (
                  <motion.button
                    key={product.id}
                    type="button"
                    onClick={() => scrollToProduct(i)}
                    className="group text-left w-full flex gap-3 md:gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a0f] rounded-xl p-3 md:p-4 transition-colors relative"
                    style={{
                      scale: buttonScaleTransforms[i],
                    }}
                  >
                    <motion.span
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        backgroundColor: "rgba(59, 130, 246, 0.14)",
                        opacity: activeEmphasis,
                        borderLeft: "3px solid rgba(96, 165, 250, 1)",
                        boxShadow: cardGlowBoxShadowTransforms[i],
                      }}
                    />
                    <div className="relative shrink-0 w-3 h-3 md:w-3.5 md:h-3.5 mt-2 md:mt-2.5 self-start">
                      <span className="absolute inset-0 rounded-full bg-slate-500" />
                      <motion.span
                        className="absolute inset-0 rounded-full bg-white"
                        style={{
                          opacity: activeTransform,
                          scale: bulletScaleTransforms[i],
                          boxShadow: "0 0 16px rgba(255,255,255,0.85), 0 0 28px rgba(59,130,246,0.5)",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <motion.p
                        className="font-orbitron font-medium leading-tight"
                        style={{
                          color: "rgb(255,255,255)",
                          opacity: opacityTransform,
                          textShadow: labelTextShadowTransforms[i],
                          fontSize: labelFontSizeTransforms[i],
                        }}
                      >
                        {product.label}
                      </motion.p>
                      <motion.p
                        className="mt-2 md:mt-3 leading-relaxed md:max-w-[420px]"
                        style={{
                          color: "rgb(226, 232, 240)",
                          opacity: i === 0 ? desc0Opacity : i === 1 ? desc1Opacity : desc2Opacity,
                          display: "block",
                          fontSize: descFontSizeTransforms[i],
                        }}
                      >
                        {product.description}
                      </motion.p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="relative flex-1 min-h-[280px] md:min-h-[360px] flex items-center justify-center overflow-hidden md:pl-10 lg:pl-16">
              {products.map((product, i) => {
                const yTransform =
                  i === 0 ? product0Y : i === 1 ? product1Y : product2Y;
                const activeTransform =
                  i === 0 ? product0Active : i === 1 ? product1Active : product2Active;
                return (
                  <motion.div
                    key={product.id}
                    className="absolute inset-0 flex items-center justify-center px-2"
                    style={{
                      y: yTransform,
                      opacity: activeTransform,
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      className="relative w-full max-w-md md:max-w-lg rounded-2xl overflow-hidden border border-blue-500/20"
                      style={{ boxShadow: "0 0 60px rgba(59,130,246,0.12)" }}
                    >
                      <video
                        className="w-full aspect-[4/3] object-cover object-top"
                        autoPlay
                        loop
                        muted
                        playsInline
                      >
                        <source src={product.video} type="video/mp4" />
                      </video>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                        <div className="px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-sm border border-blue-500/20 whitespace-nowrap">
                          <span className="text-slate-300 text-xs font-orbitron tracking-wide">
                            {product.caption}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
