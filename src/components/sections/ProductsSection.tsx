"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Settings, Hammer, Activity, ChevronRight } from "lucide-react";
import { useCountUp } from "@/hooks/use-scroll-animation";

const themeStyles = {
  primary: {
    border: "border-primary/30",
    shadow: "shadow-[0_0_40px_hsl(160_70%_45%_/_0.2)]",
    iconBg: "bg-primary/10 border-primary/20",
    iconText: "text-primary",
    tagline: "text-primary",
    flowBorder: "border-primary/20",
    statBg: "bg-primary/10 border-primary/20",
    statText: "text-primary",
  },
  blue: {
    border: "border-blue-500/30",
    shadow: "shadow-[0_0_40px_hsl(217_91%_60%_/_0.2)]",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconText: "text-blue-400",
    tagline: "text-blue-400",
    flowBorder: "border-blue-500/20",
    statBg: "bg-blue-500/10 border-blue-500/20",
    statText: "text-blue-400",
  },
  violet: {
    border: "border-violet-500/30",
    shadow: "shadow-[0_0_40px_hsl(263_70%_50%_/_0.2)]",
    iconBg: "bg-violet-500/10 border-violet-500/20",
    iconText: "text-violet-400",
    tagline: "text-violet-400",
    flowBorder: "border-violet-500/20",
    statBg: "bg-violet-500/10 border-violet-500/20",
    statText: "text-violet-400",
  },
} as const;

const products = [
  {
    id: "fabplan",
    name: "FabPlan",
    icon: Settings,
    theme: "primary" as const,
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
    theme: "blue" as const,
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
    theme: "violet" as const,
    tagline: "Simulate operations. Find bottlenecks before you build",
    desc: "Model throughput, WIP, constraints, and the impact of changes across stations. Achieve measurable throughput uplift with targeted adjustments.",
    stat: 25,
    statSuffix: "%",
    statLabel: "Throughput uplift",
    flow: ["Throughput", "Bottlenecks", "Scenarios"],
    video: "/centor.mp4",
  },
];

function ProductCard({ product, index }: { product: (typeof products)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { count, ref: counterRef } = useCountUp(product.stat, 1800);
  const theme = themeStyles[product.theme];
  const isReversed = index % 2 !== 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.1 }}
    >
      <div
        className={`bg-[#080a0f]/80 border backdrop-blur-sm overflow-hidden rounded-2xl ${theme.border} ${theme.shadow}`}
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
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${theme.iconBg}`}>
                  <product.icon className={`w-6 h-6 ${theme.iconText}`} />
                </div>
                <div>
                  <h3
                    className="font-serif text-lg md:text-xl font-extrabold text-white"
                    data-testid={`text-product-name-${product.name.toLowerCase()}`}
                  >
                    {product.name}
                  </h3>
                </div>
              </div>

              <p className={`font-serif text-sm md:text-[15px] font-medium mb-4 tracking-wide uppercase ${theme.tagline}`}>
                {product.tagline}
              </p>

              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
                {product.desc}
              </p>

              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {product.flow.map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className={`font-serif px-2.5 py-1 rounded-md bg-slate-800/80 border text-[10px] text-slate-300 ${theme.flowBorder}`}>
                      {step}
                    </span>
                    {i < product.flow.length - 1 && <ChevronRight className="w-3 h-3 text-slate-500" />}
                  </span>
                ))}
              </div>

              <div
                ref={counterRef}
                className={`rounded-lg p-4 inline-flex flex-col gap-1 border ${theme.statBg}`}
              >
                <div
                  className={`font-serif text-lg md:text-xl font-extrabold tabular-nums ${theme.statText}`}
                  data-testid={`text-stat-${product.name.toLowerCase()}`}
                >
                  {count}
                  {product.statSuffix}
                </div>
                <div className="font-serif text-[10px] text-slate-400 uppercase tracking-wider">
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
            "radial-gradient(ellipse 50% 40% at 50% 50%, hsl(160 70% 45% / 0.06) 0%, transparent 60%)",
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
            <span className="text-primary">
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
