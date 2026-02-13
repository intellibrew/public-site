"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useMousePosition, useCountUp } from "@/hooks/use-scroll-animation";

function VideoBackground() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.load();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#080a0f]" />

      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${videoLoaded ? "opacity-55" : "opacity-0"}`}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-[#080a0f]/50 via-[#080a0f]/25 to-[#080a0f]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f]/60 via-transparent to-[#080a0f]/60" />

      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[180px] animate-blob animation-delay-4000" />
      </div>
    </div>
  );
}

function ParticleField() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function AnimatedWords() {
  const words = ["factory", "production line", "layout"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative min-w-[280px] md:min-w-[380px]">
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore - AnimatePresence type issue in framer-motion v11 */}
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 28, opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -28, opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="inline-block font-sans text-[38px] md:text-[66px] text-primary drop-shadow-[0_0_16px_hsl(160_70%_45%_/_0.7)]"
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
        className="font-serif text-lg md:text-xl font-extrabold text-primary tabular-nums"
        data-testid={`text-stat-${label.toLowerCase().replace(/\s/g, "-")}`}
      >
        {count}
        {suffix}
      </span>
      <span className="font-serif text-xs md:text-sm text-slate-400 mt-1 uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  );
}

export function HeroSection({ onBookDemo }: { onBookDemo?: () => void }) {
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
      id="product"
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
      data-testid="section-hero"
    >
      <VideoBackground />
      <ParticleField />

      <motion.div
        style={{ y: yText, opacity }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        <div className="-translate-y-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-serif text-xs md:text-sm font-medium text-primary tracking-wider uppercase mb-8"
        >
          AI-Powered Factory Planning
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-8"
          style={{
            transform: `translate(${mouse.x * 3}px, ${mouse.y * 3}px)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <span className="block font-serif text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]">
            Generate your
          </span>
          <AnimatedWords />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          One platform to convert CAD, BOM, and specs into a complete production
          line model — layouts, stations, RFQs, costs, and simulations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
        >
          <button
            onClick={onBookDemo}
            className="nav-demo-btn"
            data-testid="button-hero-demo"
          >
            <span>Book a Demo</span>
          </button>
          <button
            onClick={() => scrollTo("#products")}
            className="neo-btn-outline px-8 py-3.5 rounded-full text-sm md:text-base font-semibold tracking-wide"
            data-testid="button-hero-explore"
          >
            Explore Products
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-16 md:mt-20 flex items-center justify-center gap-6 md:gap-12 flex-wrap"
        >
          <StatCounter value={2} suffix=" hrs" label="First pass model" delay={1.5} />
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/40 to-transparent hidden sm:block" />
          <StatCounter value={30} suffix="%" label="Throughput uplift" delay={1.7} />
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/40 to-transparent hidden sm:block" />
          <StatCounter value={3} suffix=" days" label="RFQ pack ready" delay={1.9} />
        </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
