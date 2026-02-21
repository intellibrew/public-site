"use client";

import { useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useMousePosition } from "@/hooks/useScrollAnimation";

function VideoBackground() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <img
        src="/factorybackground.png"
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${videoLoaded ? "opacity-0" : "opacity-40"}`}
      />

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-400 ${videoLoaded ? "opacity-30" : "opacity-0"}`}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      {/* Teal tint overlay to neutralize blue cast on factory image */}
      <div className="absolute inset-0 bg-[rgba(20,184,166,0.03)] mix-blend-overlay" />

      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-teal-500/6 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[180px] animate-blob animation-delay-4000" />
      </div>
    </div>
  );
}

type HeroSectionProps = {
  onBookDemo?: () => void;
};

export function HeroSection({ onBookDemo }: HeroSectionProps = {}) {
  const mouse = useMousePosition();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden lg:hidden"
      data-testid="section-hero"
    >
      <VideoBackground />

      <motion.div
        style={{ y: yText, opacity }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-12 font-orbitron"
          style={{
            transform: `translate(${mouse.x * 3}px, ${mouse.y * 3}px)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <span className="block text-foreground">Generate your</span>
          <span className="block text-foreground">factory</span>
          <span className="block text-primary">in hours, not</span>
          <span className="block text-primary">weeks</span>
        </motion.h1>
      </motion.div>
    </section>
  );
}
