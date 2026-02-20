"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Settings, Hammer, Activity, ChevronRight } from "lucide-react";

const products = [
  {
    id: "fabplan",
    name: "FabPlan",
    icon: Settings,
    tagline: "Design the line model from CAD + BOM",
    desc: "Convert CAD/BOM/specs into stations, takt, and an editable layout in hours. Get a first-pass line model that would normally take weeks.",
    stat: "2 hrs",
    statLabel: "First pass line model",
    flow: ["CAD / BOM", "Stations", "Layout"],
    video: "/neofab (2).mp4",
    gradient: "from-teal-500/20 via-teal-500/5 to-transparent",
    accentColor: "text-teal-400",
    bgAccent: "bg-teal-500/10",
    borderAccent: "border-teal-500/20",
    glow: "0 0 50px rgba(20,184,166,0.2), 0 0 0 1px rgba(20,184,166,0.15)",
    hoverGlow: "0 0 60px rgba(20,184,166,0.35), 0 0 0 1px rgba(20,184,166,0.3)",
  },
  {
    id: "anvil",
    name: "Anvil",
    icon: Hammer,
    tagline: "Setup your factory with RFQs and equipment packs",
    desc: "Turn the line model into machine specs, supplier shortlists, and RFQ-ready documents. Go from design to procurement in days.",
    stat: "3 days",
    statLabel: "RFQ pack generation",
    flow: ["Specs", "RFQ Pack", "Vendor Options"],
    video: "/anvil.mp4",
    gradient: "from-teal-500/20 via-teal-500/5 to-transparent",
    accentColor: "text-teal-400",
    bgAccent: "bg-teal-500/10",
    borderAccent: "border-teal-500/20",
    glow: "0 0 50px rgba(20,184,166,0.2), 0 0 0 1px rgba(20,184,166,0.15)",
    hoverGlow: "0 0 60px rgba(20,184,166,0.35), 0 0 0 1px rgba(20,184,166,0.3)",
  },
  {
    id: "centor",
    name: "CenTor",
    icon: Activity,
    tagline: "Simulate operations. Find bottlenecks before you build",
    desc: "Model throughput, WIP, constraints, and the impact of changes across stations. Achieve measurable throughput uplift with targeted adjustments.",
    stat: "30%",
    statLabel: "Throughput uplift",
    flow: ["Throughput", "Bottlenecks", "Scenarios"],
    video: "/centor.mp4",
    gradient: "from-teal-500/20 via-teal-500/5 to-transparent",
    accentColor: "text-teal-400",
    bgAccent: "bg-teal-500/10",
    borderAccent: "border-teal-500/20",
    glow: "0 0 50px rgba(20,184,166,0.2), 0 0 0 1px rgba(20,184,166,0.15)",
    hoverGlow: "0 0 60px rgba(20,184,166,0.35), 0 0 0 1px rgba(20,184,166,0.3)",
  },
];

function ProductCard({
  product,
  index,
}: {
  product: (typeof products)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const isReversed = index % 2 !== 0;

  const hoverGlow = (product as { glow: string; hoverGlow?: string }).hoverGlow ?? product.glow;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1 }}
    >
      <motion.div
        className="group rounded-2xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden cursor-default"
        style={{ boxShadow: product.glow }}
        whileHover={{
          scale: 1.01,
          boxShadow: hoverGlow,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
        transition={{ duration: 0.3 }}
        data-testid={`card-product-${product.name.toLowerCase()}`}
      >
        <div
          className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}
        >
          <div className="lg:w-1/2 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: isReversed ? 24 : -24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.gradient} border ${product.borderAccent} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                >
                  <product.icon className={`w-6 h-6 ${product.accentColor}`} />
                </div>
                <h3
                  className="text-lg md:text-xl font-bold text-foreground font-orbitron"
                  data-testid={`text-product-name-${product.name.toLowerCase()}`}
                >
                  {product.name}
                </h3>
              </div>

              <p
                className={`text-sm font-medium ${product.accentColor} mb-3 tracking-wide`}
              >
                {product.tagline}
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-lg">
                {product.desc}
              </p>

              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {product.flow.map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="rounded-md border border-border bg-muted/50 px-2.5 py-1 font-mono text-xs text-muted-foreground">
                      {step}
                    </span>
                    {i < product.flow.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                  </span>
                ))}
              </div>

              <div
                className={`${product.bgAccent} ${product.borderAccent} border rounded-xl p-4 inline-flex items-center gap-4`}
              >
                <span
                  className={`text-lg md:text-xl font-bold font-orbitron tabular-nums ${product.accentColor}`}
                  data-testid={`text-stat-${product.name.toLowerCase()}`}
                >
                  {product.stat}
                </span>
                <span className="text-sm text-muted-foreground">
                  {product.statLabel}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 relative min-h-[240px] lg:min-h-[360px] overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.35 }}
              className={`absolute inset-0 overflow-hidden transition-transform duration-500 ease-out group-hover:scale-105 ${
                isReversed ? "lg:rounded-l-2xl" : "lg:rounded-r-2xl"
              } rounded-b-2xl lg:rounded-b-none origin-center`}
            >
              <video
                className="w-full h-full object-cover object-top"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={product.video} type="video/mp4" />
              </video>
              <div
                className={`absolute inset-0 bg-gradient-to-${
                  isReversed ? "r" : "l"
                } from-card via-card/40 to-transparent pointer-events-none`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProductsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.08 });

  return (
    <section
      id="products"
      className="relative py-24 md:py-32"
      data-testid="section-products"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/5 to-background pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 55%)" }} />

      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="shiny-badge">Our Products</span>
          </motion.div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-orbitron mb-3"
            data-testid="text-products-heading"
          >
            NeoFab turns inputs into a{" "}
            <span className="text-primary">complete line model</span>
          </h2>
          <p className="text-xs font-mono text-primary uppercase tracking-widest">
            Three modules. One output.
          </p>
        </motion.div>

        <div className="space-y-12 md:space-y-16">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
