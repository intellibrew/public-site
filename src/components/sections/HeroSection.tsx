"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useMousePosition } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";

function VideoBackground() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <img
        src="/factorybackground.png"
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-0" : "opacity-40"}`}
      />

      <video
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ${videoLoaded ? "opacity-30" : "opacity-0"}`}
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

function AnimatedWords() {
  const words = ["factory", "production line", "layout", "simulation"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative min-w-[280px] md:min-w-[380px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 40, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -40, opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="gradient-text inline-block font-orbitron"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function StatCounter({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center"
    >
      <span
        className="text-lg md:text-xl font-bold font-orbitron gradient-text tabular-nums"
        data-testid={`text-stat-${label.toLowerCase().replace(/\s/g, "-")}`}
      >
        {count}
        {suffix}
      </span>
      <span className="text-xs md:text-sm text-muted-foreground font-orbitron mt-1">
        {label}
      </span>
    </motion.div>
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

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-8 font-orbitron"
          style={{
            transform: `translate(${mouse.x * 3}px, ${mouse.y * 3}px)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <span className="text-foreground">Generate your</span>
          <br />
          <AnimatedWords />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-sm text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-orbitron"
        >
          One platform to convert CAD, BOM, and specs into a complete production
          line model — layouts, stations, RFQs, costs, and simulations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-row items-center justify-center gap-4 flex-nowrap"
        >
          <button
            type="button"
            onClick={onBookDemo ?? (() => scrollTo("#contact"))}
            className="btn-cta-large inline-flex items-center justify-center px-6 py-3"
            data-testid="button-hero-demo"
          >
            Book a Demo
          </button>
          <button
            type="button"
            onClick={() => scrollTo("#products")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/50 bg-transparent px-6 py-3 text-sm font-medium font-orbitron text-primary hover:bg-primary/10 hover:border-primary transition-colors backdrop-blur-sm"
            data-testid="button-hero-explore"
          >
            Explore Products
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-20 flex items-center justify-center gap-8 md:gap-12 flex-wrap"
        >
          <StatCounter
            value={2}
            suffix=" hrs"
            label="First pass model"
            delay={1.5}
          />
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/40 to-transparent hidden sm:block" />
          <StatCounter
            value={30}
            suffix="%"
            label="Throughput uplift"
            delay={1.7}
          />
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/40 to-transparent hidden sm:block" />
          <StatCounter
            value={3}
            suffix=" days"
            label="RFQ pack ready"
            delay={1.9}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
