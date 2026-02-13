"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, FileOutput, BarChart3 } from "lucide-react";

const moments = [
  {
    icon: LayoutDashboard,
    title: "From drawing to layout",
    desc: "Auto-generate an editable floor layout from CAD/BOM. Iterate layouts in real-time, not over email chains.",
    stat: "First pass: hours",
    video: "/fromdrawingtolayout.mp4",
    gradient: "from-primary/30 via-primary/5 to-transparent",
  },
  {
    icon: FileOutput,
    title: "RFQs and quotes in one flow",
    desc: "Generate spec-ready packs and compare vendor options. From design to procurement in days, not weeks.",
    stat: "RFQ pack: 1-3 days",
    video: "/rfq.mp4",
    gradient: "from-primary/30 via-primary/5 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Simulate before you build",
    desc: "Model throughput, find bottlenecks, test scenarios. Make decisions with data, not gut feeling.",
    stat: "Bottlenecks: visible instantly",
    video: "/in-action-operations.mp4",
    gradient: "from-primary/30 via-primary/5 to-transparent",
  },
];

function ShowcaseCard({ item, index }: { item: (typeof moments)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.load();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15 }}
    >
      <Card className="bg-card/60 backdrop-blur-sm overflow-visible group transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_50px_hsl(160_70%_45%_/_0.2)] hover:-translate-y-1" data-testid={`card-showcase-${index}`}>
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          <video
            ref={videoRef}
            src={item.video}
            className={`w-full h-full object-cover transition-opacity duration-300 group-hover:scale-105 ${videoReady ? "opacity-95" : "opacity-0"}`}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            data-testid={`video-showcase-${index}`}
          >
            <source src={item.video} type="video/mp4" />
          </video>
          <div className={`absolute inset-0 bg-gradient-to-b ${item.gradient} opacity-40`} />
          <div className="absolute inset-0 bg-gradient-to-t from-card/40 via-transparent to-transparent pointer-events-none" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.3 + index * 0.15, type: "spring" }}
            className="absolute top-4 left-4"
          >
            <div className="w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-foreground" />
            </div>
          </motion.div>
        </div>

        <CardContent className="p-6">
          <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors" data-testid={`text-showcase-title-${index}`}>
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{item.desc}</p>
          <div className="px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 inline-block">
            <span className="text-xs font-mono text-primary" data-testid={`text-showcase-stat-${index}`}>{item.stat}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function InActionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="in-action" className="relative py-24 md:py-36 overflow-hidden" data-testid="section-showcase">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" data-testid="text-showcase-heading">
            See NeoFab <span className="gradient-text-animated">in action</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Three moments that collapse months of planning into minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {moments.map((item, i) => (
            <ShowcaseCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
