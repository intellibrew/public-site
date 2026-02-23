"use client";

import { useRef, useEffect } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, FileText, Activity, ChevronRight } from "lucide-react";
import { FabPlanVisual, AnvilVisual, CenTorVisual } from "@/components/product-visuals";

function LazyVideo({
  src,
  sources,
  className,
  ...props
}: {
  src?: string;
  sources?: string[];
  className?: string;
  [key: string]: unknown;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceList = sources ?? (src ? [src] : []);
  const indexRef = useRef(0);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || sourceList.length === 0) return;

    node.src = sourceList[0];

    const handleEnded = () => {
      if (sourceList.length > 1) {
        indexRef.current = (indexRef.current + 1) % sourceList.length;
        node.src = sourceList[indexRef.current];
        node.play().catch(() => {});
      } else {
        node.currentTime = 0;
        node.play().catch(() => {});
      }
    };

    node.addEventListener("ended", handleEnded);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.play().catch(() => {});
        } else {
          node.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);

    return () => {
      node.removeEventListener("ended", handleEnded);
      observer.disconnect();
    };
  }, [sourceList.length]);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || sourceList.length === 0) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      preload="metadata"
      className={className}
      {...props}
    />
  );
}

const products = [
  {
    icon: Cpu,
    name: "FabPlan",
    tagline: "Design the line model from CAD + BOM",
    desc: "Convert CAD/BOM/specs into stations, takt, and an editable layout in hours. Get a first-pass line model that would normally take weeks.",
    stat: 2,
    statSuffix: " hrs",
    statLabel: "First pass line model",
    flow: ["CAD / BOM", "Stations", "Layout"],
    Visual: FabPlanVisual,
    video: "/fabplan-hero-1.mp4",
    videoSources: ["/fabplan-hero-1.mp4", "/fabplan-hero-2.mp4"],
    color: "emerald",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    accentColor: "text-emerald-400",
    bgAccent: "bg-emerald-500/10",
    borderAccent: "border-emerald-500/20",
    videoOverlay: "from-emerald-950/60 via-emerald-950/30 to-emerald-950/60",
    glowDefault: "0 0 0 1px rgba(16,185,129,0.12), 0 4px 24px -4px rgba(0,0,0,0.2)",
    glowHover: "0 0 48px rgba(16,185,129,0.4), 0 0 0 1px rgba(16,185,129,0.35), 0 8px 32px -8px rgba(0,0,0,0.25)",
  },
  {
    icon: FileText,
    name: "Anvil",
    tagline: "Setup your factory with RFQs and equipment packs",
    desc: "Turn the line model into machine specs, supplier shortlists, and RFQ-ready documents. Go from design to procurement in days.",
    stat: 3,
    statSuffix: " days",
    statLabel: "RFQ pack generation",
    flow: ["Line Model", "RFQ Pack", "Vendor Options"],
    Visual: AnvilVisual,
    video: "/anvil-hero-1.mp4",
    videoSources: ["/anvil-hero-1.mp4", "/anvil-hero-2.mp4"],
    color: "blue",
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    accentColor: "text-blue-400",
    bgAccent: "bg-blue-500/10",
    borderAccent: "border-blue-500/20",
    videoOverlay: "from-blue-950/60 via-blue-950/30 to-blue-950/60",
    glowDefault: "0 0 0 1px rgba(59,130,246,0.12), 0 4px 24px -4px rgba(0,0,0,0.2)",
    glowHover: "0 0 48px rgba(59,130,246,0.4), 0 0 0 1px rgba(59,130,246,0.35), 0 8px 32px -8px rgba(0,0,0,0.25)",
  },
  {
    icon: Activity,
    name: "CenTor",
    tagline: "Simulate operations. Find bottlenecks before you build",
    desc: "Feed your CAD models and BOM into a digital twin simulation. Model throughput, WIP, constraints, and the impact of changes across stations.",
    stat: 30,
    statSuffix: "%",
    statLabel: "Throughput uplift",
    flow: ["CAD / BOM", "Process Flow", "Simulation"],
    Visual: CenTorVisual,
    video: "/centor-hero.mp4",
    videoSources: ["/centor-hero.mp4"],
    color: "violet",
    gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
    accentColor: "text-violet-400",
    bgAccent: "bg-violet-500/10",
    borderAccent: "border-violet-500/20",
    videoOverlay: "from-violet-950/60 via-violet-950/30 to-violet-950/60",
    glowDefault: "0 0 0 1px rgba(139,92,246,0.12), 0 4px 24px -4px rgba(0,0,0,0.2)",
    glowHover: "0 0 48px rgba(139,92,246,0.4), 0 0 0 1px rgba(139,92,246,0.35), 0 8px 32px -8px rgba(0,0,0,0.25)",
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
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { count, ref: counterRef } = useCountUp(product.stat, 1800);

  const isReversed = index % 2 !== 0;

  const productWithGlow = product as (typeof product) & { glowDefault?: string; glowHover?: string };
  const defaultGlow = productWithGlow.glowDefault ?? "0 4px 24px -4px rgba(0,0,0,0.2)";
  const hoverGlow = productWithGlow.glowHover ?? defaultGlow;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="rounded-xl"
    >
      <motion.div
        style={{ boxShadow: defaultGlow }}
        initial={false}
        whileHover={{ boxShadow: hoverGlow }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-xl"
      >
        <Card
          className="bg-card/60 backdrop-blur-sm overflow-visible border-border/80 rounded-xl"
          data-testid={`card-product-${product.name.toLowerCase()}`}
        >
        <CardContent className="p-0">
          <div
            className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}
          >
            <div className="lg:w-1/2 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${product.gradient} ${product.borderAccent} border flex items-center justify-center`}
                  >
                    <product.icon
                      className={`w-6 h-6 ${product.accentColor}`}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg md:text-xl font-bold text-foreground font-orbitron tracking-tight"
                      data-testid={`text-product-name-${product.name.toLowerCase()}`}
                    >
                      {product.name}
                    </h3>
                  </div>
                </div>

                <p
                  className={`text-sm font-medium ${product.accentColor} mb-4 tracking-wide`}
                >
                  {product.tagline}
                </p>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-lg">
                  {product.desc}
                </p>

                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  {product.flow.map((step, i) => (
                    <span key={step} className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {step}
                      </Badge>
                      {i < product.flow.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      )}
                    </span>
                  ))}
                </div>

                <div
                  ref={counterRef}
                  className={`${product.bgAccent} ${product.borderAccent} border rounded-lg p-5 inline-flex items-center gap-4`}
                >
                  <div
                    className={`text-lg md:text-xl font-bold ${product.accentColor} tabular-nums`}
                    data-testid={`text-stat-${product.name.toLowerCase()}`}
                  >
                    {count}
                    {product.statSuffix}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {product.statLabel}
                  </div>
                </div>
              </motion.div>
            </div>

            <div
              className="lg:w-1/2 relative min-h-[300px] lg:min-h-[420px]"
              data-testid={`visual-product-${product.name.toLowerCase()}`}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`absolute inset-0 overflow-hidden rounded-b-xl lg:rounded-b-none ${isReversed ? "lg:rounded-l-xl" : "lg:rounded-r-xl"}`}
              >
                {isInView && (
                  <>
                    <LazyVideo
                      src={product.videoSources ? undefined : product.video}
                      sources={product.videoSources}
                      className="absolute inset-0 w-full h-full object-cover"
                      data-testid={`video-product-${product.name.toLowerCase()}`}
                    />

                    <div
                      className={`absolute inset-0 bg-gradient-to-b ${product.videoOverlay}`}
                    />
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />

                    <div className="absolute inset-0 z-10">
                      <product.Visual />
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}

export function ProductsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  return (
    <section
      id="products"
      className="relative py-24 md:py-40"
      data-testid="section-products"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/10 to-background" />

      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="flex justify-center mb-4">
            <span className="shiny-badge">Our Products</span>
          </div>
          <h2
            className="text-heading mb-2"
            data-testid="text-products-heading"
          >
            NeoFab turns inputs into a{" "}
            <span className="gradient-text-animated">complete line model</span>
          </h2>
        </motion.div>

        <div className="space-y-12">
          {products.map((product, i) => (
            <ProductCard key={product.name} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
