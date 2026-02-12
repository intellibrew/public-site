"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Settings, Hammer, Activity, ChevronRight } from "lucide-react";
import { useCountUp } from "@/hooks/use-scroll-animation";

const products = [
  {
    id: "fabplan",
    name: "FabPlan",
    icon: Settings,
    tagline: "Design the line model from CAD + BOM",
    desc: "Convert CAD/BOM/specs into stations, takt, and an editable layout in hours. Get a first-pass line model that would normally take weeks.",
    stat: 2,
    statSuffix: " hours",
    statLabel: "First pass line model",
    flow: ["CAD / BOM", "Stations", "Layout"],
    video: "/neofab (2).mp4",
  },
  {
    id: "anvil",
    name: "Anvil",
    icon: Hammer,
    tagline: "Setup your factory with RFQs and equipment packs",
    desc: "Turn the line model into machine specs, supplier shortlists, and RFQ-ready documents. Go from design to procurement in days.",
    stat: 3,
    statSuffix: " days",
    statLabel: "RFQ pack generation",
    flow: ["Specs", "RFQ Pack", "Vendor Options"],
    video: "/anvil.mp4",
  },
  {
    id: "centor",
    name: "CenTor",
    icon: Activity,
    tagline: "Simulate operations. Find bottlenecks before you build",
    desc: "Model throughput, WIP, constraints, and the impact of changes across stations. Achieve measurable throughput uplift with targeted adjustments.",
    stat: 25,
    statSuffix: "%",
    statLabel: "Throughput uplift",
    flow: ["Throughput", "Bottlenecks", "Scenarios"],
    video: "/centor.mp4",
  },
];

function ProductCard({ product, index }: { product: typeof products[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { count, ref: counterRef } = useCountUp(product.stat, 1800);

  const isReversed = index % 2 !== 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.1 }}
    >
      <div
        className="bg-[#080a0f]/80 border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)] backdrop-blur-sm overflow-hidden rounded-2xl"
        data-testid={`card-product-${product.name.toLowerCase()}`}
      >
        <div className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
          <div className="lg:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <product.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3
                    className="font-orbitron text-lg md:text-xl font-bold text-white"
                    data-testid={`text-product-name-${product.name.toLowerCase()}`}
                  >
                    {product.name}
                  </h3>
                </div>
              </div>

              <p className="font-orbitron text-sm md:text-[15px] font-medium text-blue-300 mb-4 tracking-wide uppercase">
                {product.tagline}
              </p>

              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
                {product.desc}
              </p>

              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {product.flow.map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="font-orbitron px-2.5 py-1 rounded-md bg-slate-800/80 border border-blue-500/20 text-[10px] text-slate-300">
                      {step}
                    </span>
                    {i < product.flow.length - 1 && <ChevronRight className="w-3 h-3 text-slate-500" />}
                  </span>
                ))}
              </div>

              <div
                ref={counterRef}
                className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 inline-flex flex-col gap-1"
              >
                <div
                  className="font-orbitron text-lg md:text-xl font-bold text-blue-400 tabular-nums"
                  data-testid={`text-stat-${product.name.toLowerCase()}`}
                >
                  {count}
                  {product.statSuffix}
                </div>
                <div className="font-orbitron text-[10px] text-slate-400 uppercase tracking-wider">
                  {product.statLabel}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 relative min-h-[280px] lg:min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute inset-0 overflow-hidden rounded-b-2xl lg:rounded-b-none lg:rounded-r-2xl"
            >
              <video
                className="w-full h-full object-cover transition-opacity duration-1000"
                autoPlay
                loop
                muted
                playsInline
                data-testid={`video-product-${product.name.toLowerCase()}`}
              >
                <source src={product.video} type="video/mp4" />
              </video>
              <div
                className={`absolute inset-0 bg-gradient-to-${isReversed ? "r" : "l"} from-[#080a0f]/60 via-[#080a0f]/25 to-transparent`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f]/40 via-transparent to-[#080a0f]/15" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  return (
    <section
      id="products"
      className="relative bg-[#080a0f] py-24 md:py-36"
      data-testid="section-products"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 60%)",
        }}
      />

      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="shiny-badge">Our Products</span>
          <h2
            className="text-heading mt-4 mb-2"
            data-testid="text-products-heading"
          >
            NeoFab turns inputs into a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300">
              complete line model
            </span>
          </h2>
          <p className="text-body">Three modules. One Factory Output.</p>
        </motion.div>

        <div className="space-y-10 md:space-y-12">
          {products.map((product, i) => (
            <ProductCard key={product.name} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
