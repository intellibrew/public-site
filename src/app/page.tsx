"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { AnimateInView } from "@/components/AnimateInView"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Factory,
  Layers,
  LineChart,
  Search,
  Shield,
  Network,
  HelpCircle,
  PlusCircle,
  MinusCircle,
} from "lucide-react"
import { submitFeedback } from "../app/api_requests/feedback"
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { IntroducingSection } from "@/components/sections/IntroducingSection";
import { ProductsSection } from "@/components/sections/ProductsSection";
import { TeamsSection } from "@/components/sections/TeamsSection";
import { InActionSection } from "@/components/sections/InActionSection";
import { UseCasesSection } from "@/components/sections/UseCasesSection";
import { ClientsSection } from "@/components/sections/ClientsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { SideNav } from "@/components/SideNav";
import ScrollProgress from "@/components/ScrollProgress";
import FactoryFlowMap from "@/components/FactoryFlowMap";
import { motion } from "framer-motion";
// -----------------------------------------------------------------------------
// Feature data
// -----------------------------------------------------------------------------

type FeatureItem = {
  title: string
  desc: string
  icon: React.ReactNode
  badge?: string
}

const FEATURES: FeatureItem[] = [
  {
    title: "Auto-Layout Engine",
    desc:
      "Upload your specs and constraints to generate production-ready layouts with aisles, utilities, and safety built in.",
    icon: <Factory className="h-5 w-5" />,
    badge: "99% faster",
  },
  {
    title: "Workflow Synthesis",
    desc:
      "AI maps process steps and machine options for takt, throughput, and yield - no spreadsheets, no guesswork.",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    title: "Digital RFQ & Vendor Connect",
    desc:
      "Go from specs to qualified suppliers in one flow. RFQs cut from weeks to a single day.",
    icon: <Search className="h-5 w-5" />,
  },
  {
    title: "Cost & Utilization Model",
    desc:
      "Instant CapEx/OpEx insights with trade-off comparisons for smarter decisions.",
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    title: "Quality by Design",
    desc:
      "Built-in standards and AI checks keep throughput high without sacrificing yield.",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: "Supplier Graph Integration",
    desc:
      "Replace fragmented sheets with a unified vendor view for faster, integrated supply chains.",
    icon: <Network className="h-5 w-5" />,
  },
]

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function Home() {
  const [progress, setProgress] = useState(0)
  const [demoOpen, setDemoOpen] = useState(false)
  const [flowHoverPos, setFlowHoverPos] = useState<{ x: number; y: number } | null>(null)

  // Hover preview (debounced) for the demo cards
  const [hoveredDemo, setHoveredDemo] = useState<number | null>(null)
  const showTimer = useRef<NodeJS.Timeout | null>(null)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)

  const onDemoEnter = useCallback((idx: number) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    showTimer.current = setTimeout(() => setHoveredDemo(idx), 90)
  }, [])

  const onDemoLeave = useCallback(() => {
    if (showTimer.current) clearTimeout(showTimer.current)
    hideTimer.current = setTimeout(() => setHoveredDemo(null), 120)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const h =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      setProgress(Math.max(0, (window.scrollY / Math.max(1, h)) * 100))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (showTimer.current) clearTimeout(showTimer.current)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  // Demo card copy (per-card images)
  const DEMOS = useMemo(
    () => [
      {
        title: "From Drawing to Layout",
        caption:
          "Upload CAD files and get optimized lines, aisles, and utilities in minutes.",
        alt: "Auto layout demo",
        image: "/demo.png",
      },
      {
        title: "Vendors and Quotes in One Flow",
        caption:
          "Turn specs into vetted suppliers. RFQs go from weeks to a single day.",
        alt: "Vendor integration demo",
        image: "/demo1.png",
      },
      {
        title: "Execution at Scale",
        caption:
          "Export layouts, compliance packs, and push tasks into project management.",
        alt: "Execution & PM demo",
        image: "/demo2.png",
      },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">
      <ScrollProgress />
      <Header onBookDemo={() => setDemoOpen(true)} />
      <SideNav />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.22, 0.61, 0.36, 1], delay: 0.05 }}
      >
      {/* Main */}
      <main id="home" className="scroll-mt-24">
        {/* Hero */}
        <section
          id="product"
          className="relative overflow-hidden min-h-[80vh] md:min-h-screen"
        >
          {/* Background factory image */}
          <div className="absolute inset-0">
            <Image
              src="/factorybackground.png"
              alt="Factory background"
              fill
              priority
              className="object-cover lg:object-fill"
            />
            {/* Keep image crisp, bright center, darker corners + subtle site-blue tint */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner vignettes */}
              <div className="absolute inset-0 bg-[radial-gradient(1000px_800px_at_0%_0%,rgba(4,7,21,0.8),transparent_60%),radial-gradient(1000px_800px_at_100%_0%,rgba(4,7,21,0.8),transparent_60%),radial-gradient(1200px_900px_at_50%_100%,rgba(4,7,21,0.9),transparent_65%)]" />
              {/* Soft blue tone over everything, but center stays bright */}
              <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_40%_45%,rgba(37,99,235,0.06),transparent_70%),radial-gradient(circle_at_center,rgba(15,23,42,0.15),rgba(15,23,42,0.45))] mix-blend-soft-light" />
            </div>
          </div>

          <div
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 90% 85% at 75% 50%, transparent 0%, transparent 35%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.45) 100%)",
            }}
          />

          <div
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{
              background: flowHoverPos
                ? `radial-gradient(ellipse 480px 200px at ${flowHoverPos.x}% ${flowHoverPos.y}%, transparent 0%, transparent 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.35) 100%)`
                : "transparent",
              opacity: flowHoverPos ? 1 : 0,
              transition: "opacity 200ms ease-out",
            }}
          />

          <div className="hidden lg:block absolute inset-0 z-20">
            <FactoryFlowMap onActiveChange={setFlowHoverPos} />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[80vh] md:min-h-screen max-w-7xl flex-col items-start justify-end px-4 pt-28 pb-[4.75rem] text-left md:px-8 md:items-start md:justify-center lg:flex-row lg:items-center lg:justify-between lg:text-left lg:pt-24 lg:pb-24 pointer-events-none lg:pointer-events-none">
            <div className="w-full lg:w-[45%] max-w-xl space-y-6 pl-0 md:pl-0 md:ml-[-2.5rem] lg:ml-[-4.5rem] shrink-0">
              <AnimateInView delay={40}>
                <h1 className="text-[36px] leading-[44px] md:text-[60px] md:leading-[68px] font-bold">
                  <span className="block font-orbitron text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]">
                    Generate your
                  </span>
                  <AnimatedWords />
                </h1>
                <p className="mt-4 md:mt-5 text-sm md:text-base text-slate-300/95 max-w-lg leading-relaxed drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                  One platform to convert CAD, BOM, and specs into a complete production line model - layouts, stations, RFQs, costs, and simulations.
                </p>
              </AnimateInView>
            </div>
          </div>
        </section>

        <ProblemSection />

        {/* Introducing section */}
        <IntroducingSection />

        {/* Use Cases section */}
        <UseCasesSection />

        {/* Products section */}
        <ProductsSection />

        {/* Teams section */}
        <TeamsSection onBookDemo={() => setDemoOpen(true)} />

        {/* In Action section */}
        <InActionSection />

        {/* Clients section */}
        <ClientsSection />

        {/* About, FAQ & Contact */}
        <div className="relative bg-[#080a0f] overflow-hidden">
          <AboutSection />
          <FAQSection />
          <CTASection onBookDemo={() => setDemoOpen(true)} />
        </div>

        {/* Demo request modal */}
        <RequestDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      </main>

      {/* Footer */}
      <Footer />
      </motion.div>

      {/* Inline styles */}
      <style jsx>{`
        /* Brand accents */
        .brand-ai {
          background-image: linear-gradient(90deg, #4f46e5, #0284c7, #0891b2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 18px rgba(56, 189, 248, 0.35),
            0 0 6px rgba(2, 132, 199, 0.35);
        }
        .brand-glow { text-shadow: 0 0 12px rgba(56, 189, 248, 0.25); }
        .glow-header:hover { text-shadow: 0 0 28px rgba(56, 189, 248, 0.35); }
        .hover\\:glow-text:hover { text-shadow: 0 0 16px rgba(56, 189, 248, 0.35); }

        /* Background glows (static) */
        .bg-balls { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
        .ball { position: absolute; border-radius: 9999px; filter: blur(42px); opacity: 0.65; transform: translateZ(0); }
        .ball-1 {
          top: 8%; left: 12%; width: 22rem; height: 22rem;
          background: radial-gradient(closest-side, rgba(99,102,241,0.45), rgba(14,165,233,0.35), rgba(8,145,178,0.22), transparent 70%);
        }
        .ball-2 {
          top: 52%; right: 8%; width: 26rem; height: 26rem;
          background: radial-gradient(closest-side, rgba(14,165,233,0.35), rgba(56,189,248,0.3), rgba(99,102,241,0.22), transparent 70%);
        }
        .ball-3 {
          bottom: 6%; left: 28%; width: 24rem; height: 24rem;
          background: radial-gradient(closest-side, rgba(56,189,248,0.3), rgba(14,165,233,0.26), rgba(99,102,241,0.18), transparent 70%);
        }

        /* Soft hero glow */
        .hero-soft-glow {
          position: absolute; inset: -20% -10% -30% -10%; pointer-events: none;
          background:
            radial-gradient(40% 32% at 20% 22%, rgba(99,102,241,0.22), transparent 60%),
            radial-gradient(52% 38% at 78% 18%, rgba(56,189,248,0.24), transparent 60%),
            radial-gradient(48% 36% at 42% 82%, rgba(6,182,212,0.22), transparent 60%);
          filter: blur(34px); opacity: .9;
        }

        /* Buttons */
        .neo-btn {
          position: relative;
          background: linear-gradient(90deg, #c7d2fe, #bae6fd, #a5f3fc);
          color: #0b1220;
          border-radius: 9999px;
          overflow: hidden;
          box-shadow: 0 14px 44px -18px rgba(2, 132, 199, 0.5);
          transition: filter 220ms ease, transform 220ms ease;
        }
        .neo-btn:hover { filter: saturate(115%) brightness(1.02); transform: translateY(-1px); }
        .neo-btn:before {
          content: ""; position: absolute; inset: -3px; border-radius: 9999px;
          background: conic-gradient(
            from 180deg,
            rgba(199,210,254,0.45),
            rgba(186,230,253,0.65),
            rgba(165,243,252,0.45),
            rgba(199,210,254,0.45)
          );
          filter: blur(8px); z-index: -1; animation: borderGlow 4.5s linear infinite;
        }
        @keyframes borderGlow { to { transform: rotate(360deg); } }

        .btn-halo { position: relative; }
        .btn-halo::after {
          content: ""; position: absolute; inset: -14px; z-index: -2; border-radius: 9999px;
          background: radial-gradient(60% 60% at 50% 50%, rgba(56,189,248,.35), rgba(59,130,246,.25), transparent 70%);
          filter: blur(18px); opacity: .9; transition: transform .3s ease, opacity .3s ease;
        }
        .btn-halo:hover::after { transform: scale(1.06); opacity: 1; }

        .neo-btn-outline {
          position: relative; color: #0b1220; border-radius: 9999px; background: white;
          box-shadow: 0 10px 32px -18px rgba(2,132,199,0.25);
        }
        .neo-btn-outline:before {
          content: ""; position: absolute; inset: 0; padding: 1px; border-radius: inherit;
          background: linear-gradient(90deg, #c7d2fe, #bae6fd, #a5f3fc);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: outlineShift 6s linear infinite;
        }
        @keyframes outlineShift { to { filter: hue-rotate(360deg); } }

        /* Demo card sheen + lift */
        .sheen {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(
            60deg,
            transparent 15%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 85%
          );
          transform: translateX(-150%) rotate(0.001deg);
          transition: transform 900ms cubic-bezier(0.2, 0.6, 0, 1);
          pointer-events: none;
        }
        .demo-card:hover .sheen { transform: translateX(150%) rotate(0.001deg); }

        /* Animated underline */
        .animated-underline {
          background: linear-gradient(90deg,#c7d2fe,#bae6fd,#a5f3fc,#c7d2fe);
          background-size: 200% 100%;
          animation: underline-pan 8s linear infinite;
          filter: saturate(115%);
        }
        @keyframes underline-pan { to { background-position: 200% center; } }

        /* Ken Burns */
        .kenburns {
          animation: ken 18s ease-in-out infinite alternate;
          transform-origin: center;
          will-change: transform;
        }
        .demo-card:hover .kenburns { animation-duration: 8s; }
        @keyframes ken {
          0%   { transform: scale(1.02) translateY(0px); }
          100% { transform: scale(1.07) translateY(-6px); }
        }

        /* Lift on card hover */
        .card-lift {
          transition: transform .35s cubic-bezier(.2,.6,0,1), box-shadow .35s ease;
        }
        .card-lift:hover { transform: translateY(-4px); }

        /* Problem graph (right side of "Problem" section) */
        .problem-node {
          position: absolute;
          padding: 0.25rem 0.7rem;
          border-radius: 999px;
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          text-transform: none;
          background: radial-gradient(circle at 0% 0%, rgba(15,23,42,0.9), rgba(15,23,42,0.95));
          color: rgba(248,250,252,0.9);
          border: 1px solid rgba(248,113,113,0.22);
          box-shadow:
            0 0 0 1px rgba(15,23,42,0.9),
            0 14px 40px -24px rgba(15,23,42,1);
        }

        .problem-center {
          position: absolute;
          top: 54%;
          left: 50%;
          width: 54px;
          height: 54px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          border: 1px dashed rgba(248,113,113,0.6);
          background: radial-gradient(circle at 50% 50%, rgba(127,29,29,0.7), transparent 70%);
          display: grid;
          place-items: center;
          box-shadow: 0 0 40px rgba(248,113,113,0.45);
        }

        .problem-center span {
          font-size: 1.4rem;
          color: rgba(254,202,202,0.95);
        }

        .problem-line {
          position: absolute;
          border-top: 1px dotted rgba(248,113,113,0.6);
          transform-origin: left center;
        }

        .problem-line-a {
          top: 52px;
          left: 68px;
          width: 46%;
          transform: rotate(11deg);
        }

        .problem-line-b {
          top: 52px;
          right: 70px;
          width: 46%;
          transform-origin: right center;
          transform: rotate(-11deg);
        }

        .problem-line-c {
          top: 138px;
          left: 70px;
          width: 38%;
          transform: rotate(-12deg);
        }

        .problem-line-d {
          top: 138px;
          right: 70px;
          width: 38%;
          transform-origin: right center;
          transform: rotate(12deg);
        }

        .problem-dot {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #fb7185;
          box-shadow: 0 0 14px rgba(248,113,113,0.85);
          animation: problemDot 6s ease-in-out infinite;
        }

        @keyframes problemDot {
          0% {
            top: 54px;
            left: 86px;
          }
          25% {
            top: 75px;
            left: 52%;
          }
          50% {
            top: 148px;
            right: 88px;
          }
          75% {
            top: 148px;
            left: 86px;
          }
          100% {
            top: 54px;
            left: 86px;
          }
        }

        /* Animated headline ring */
        .problem-heading-orbit {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 230px;
          height: 230px;
          opacity: 0.8;
          filter: drop-shadow(0 0 18px rgba(248,113,113,0.45));
          transform-origin: 50% 50%;
          transform-box: fill-box;
          animation: problemHeadingSpin 26s linear infinite;
        }

        .problem-heading-text {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
            "Inter", sans-serif;
          font-size: 8px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          fill: rgba(254,202,202,0.85);
          dominant-baseline: middle;
        }

        @keyframes problemHeadingSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Typography rhythm */
        h2 { line-height: 1.12; }
        p, li { line-height: 1.5; }

        /* =========================
           FAQ - animated accordion
           ========================= */
        .faq-item{
          position: relative;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid rgba(228,228,231,.9);
          background: rgba(255,255,255,.94);
          box-shadow: 0 18px 60px -28px rgba(2,132,199,.18);
          transition: transform .25s ease, box-shadow .25s ease, background .25s ease;
        }
        .faq-item:hover{ transform: translateY(-1px); }
        .faq-item[open]{ box-shadow: 0 26px 90px -34px rgba(2,132,199,.25); }

        .faq-item::after{
          content:"";
          position:absolute; inset:-1px;
          border-radius: 16px;
          background: linear-gradient(90deg,#c7d2fe,#bae6fd,#a5f3fc,#c7d2fe);
          filter: saturate(115%);
          opacity: 0;
          transition: opacity .35s ease;
          pointer-events:none;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          padding: 1px; 
          -webkit-mask-composite: xor; mask-composite: exclude;
        }
        .faq-item:hover::after,
        .faq-item[open]::after{ opacity: .7; }

        .faq-summary{
          display:flex; align-items:center; justify-content:space-between;
          list-style:none; cursor:pointer;
          padding: 14px 16px;
          gap: 14px;
        }
        .faq-summary::-webkit-details-marker{ display:none; }

        .faq-left{ display:flex; align-items:center; gap:12px; }
        .q-icon{
          display:grid; place-items:center;
          width: 28px; height: 28px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(99,102,241,.12), rgba(56,189,248,.12));
          border: 1px solid rgba(228,228,231,.9);
          box-shadow: 0 6px 14px -10px rgba(2,132,199,.25);
          transition: transform .25s ease;
        }
        .faq-item:hover .q-icon{ transform: translateY(-1px); }

        .q-text{ font-weight: 600; color: #0b1220; }

        /* Slide open without JS using grid-rows trick */
        .faq-content{
          display:grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows .45s cubic-bezier(.2,.6,0,1);
          padding: 0 16px 0 16px;
        }
        .faq-item[open] .faq-content{ grid-template-rows: 1fr; padding-bottom: 14px; }
        .faq-inner{ overflow:hidden; }
        .faq-inner p{ margin-top: 6px; line-height: 1.6; }
        /* End FAQ */
      `}</style>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

function BackgroundBalls() {
  return (
    <div aria-hidden className="bg-balls">
      <div className="ball ball-1" />
      <div className="ball ball-2" />
      <div className="ball ball-3" />
    </div>
  )
}

function AnimatedWords() {
  const WORDS = ["Layout", "Simulation", "Factory", "Production line"]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length)
    }, 2600)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="mt-1 md:mt-2 inline-block relative">
      <span className="block h-[1.3em] md:h-[1.4em] leading-none">
        <motion.span
          key={WORDS[index]}
          initial={{ y: 28, opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="inline-block font-orbitron text-[38px] md:text-[66px] text-[rgb(0,77,255)] drop-shadow-[0_0_16px_rgba(37,99,235,0.7)]"
        >
          {WORDS[index]}
        </motion.span>
      </span>
    </span>
  )
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <AnimateInView>
        <div className="mx-auto inline-block rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-600 shadow-[0_6px_18px_-10px_rgba(15,23,42,0.2)]">
          {eyebrow}
        </div>
      </AnimateInView>
      <AnimateInView delay={80}>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl hover:glow-text">
          {title}
        </h2>
      </AnimateInView>
    </div>
  )
}

function FlowCard({
  title,
  bullets,
  icon,
}: {
  title: string
  bullets: string[]
  icon: React.ReactNode
}) {
  return (
    <AnimateInView>
      <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/85 bg-white/90 p-6 backdrop-blur ring-1 ring-white shadow-[0_36px_120px_-44px_rgba(15,23,42,0.3)] transition hover:shadow-[0_44px_160px_-52px_rgba(2,132,199,0.33)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-16 -z-10 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,102,241,0.12),rgba(56,189,248,0.12),rgba(6,182,212,0.12),transparent,transparent,rgba(99,102,241,0.12))] blur-2xl animate-[halo_11s_ease-in-out_infinite]"
        />
        <div className="mb-3 flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-full ring-1 ring-zinc-200 bg-gradient-to-br from-indigo-600/10 via-sky-500/10 to-cyan-500/10 transition-transform duration-300 group-hover:-translate-y-0.5">
            <div className="rounded-full bg-white p-2 ring-1 ring-zinc-200 shadow-sm">
              {icon}
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full blur-2xl opacity-70 bg-[radial-gradient(closest-side,rgba(56,189,248,0.35),transparent)]"
            />
          </div>
          <div className="text-base font-semibold tracking-tight">{title}</div>
        </div>
        <ul className="mt-2 space-y-2.5 text-[15px] text-zinc-700">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </AnimateInView>
  )
}

function DemoCard({
  index,
  title,
  caption,
  imageAlt,
  imageSrc,
  onEnter,
  onLeave,
}: {
  index: number
  title: string
  caption: string
  imageAlt: string
  imageSrc: string
  onEnter?: () => void
  onLeave?: () => void
}) {
  const reveal = 80 + index * 100 // staggered
  return (
    <AnimateInView delay={reveal}>
      <article
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="demo-card card-lift group relative overflow-hidden rounded-2xl border border-zinc-200/85 bg-white/90 backdrop-blur ring-1 ring-white shadow-[0_36px_120px_-44px_rgba(15,23,42,0.3)] transition hover:shadow-[0_48px_180px_-56px_rgba(2,132,199,0.35)]"
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold tracking-tight hover:glow-text">
            {title}
          </h3>
          <p className="mt-1 text-sm text-zinc-600">{caption}</p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 sheen" />
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1600}
            height={900}
            className="kenburns h-auto w-full scale-[1.01] transform-gpu object-cover transition duration-500 group-hover:scale-[1.03]"
            priority
          />
          {/* top gradient strip */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(59,130,246,0.22)_0%,rgba(14,165,233,0.18)_60%,transparent_100%)]"
          />
        </div>
      </article>
    </AnimateInView>
  )
}

function HoverPreview({ active, title, imageSrc }: { active: boolean; title: string; imageSrc?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[85] hidden items-center justify-center md:flex",
        "transition-all duration-250",
        active ? "opacity-100" : "opacity-0"
      )}
      aria-hidden
    >
      <div
        className={cn(
          "mx-auto w-[min(920px,92vw)] origin-center rounded-3xl border border-zinc-200/80 bg-white/80 backdrop-blur-xl",
          "shadow-[0_40px_140px_-50px_rgba(2,132,199,0.35)] ring-1 ring-white",
          "transition-all duration-250",
          active ? "scale-100 translate-y-0" : "scale-95 translate-y-2"
        )}
      >
        <div className="h-1.5 w-full rounded-t-3xl bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600" />
        <div className="p-5">
          <div className="mb-3 text-sm font-semibold tracking-wide text-zinc-700">
            {title}
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <Image
              src={imageSrc ?? "/demo.png"}
              alt="Demo preview"
              width={1920}
              height={1080}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/40" />
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ item, index }: { item: FeatureItem; index: number }) {
  return (
    <AnimateInView>
      <div
        className={cn(
          "group relative h-full overflow-hidden rounded-2xl border bg-white p-6 ring-1 ring-white shadow-[0_26px_80px_-30px_rgba(15,23,42,0.28)] transition",
          "border-zinc-200 hover:shadow-[0_40px_140px_-46px_rgba(2,132,199,0.38)]"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.24),transparent)] blur-3xl animate-[halo_9s_ease-in-out_infinite]"
          style={{ animationDelay: `${index * 0.35}s` }}
        />
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs">
          {item.icon}
          <span className="font-medium">{item.title}</span>
          {item.badge && (
            <span className="ml-2 rounded-full bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-600">{item.desc}</p>
        <div className="mt-4 h-[2px] w-24 origin-left scale-x-0 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 transition-transform duration-500 group-hover:scale-x-100" />
      </div>
    </AnimateInView>
  )
}

// Modal — posts to NeoFab backend (submitFeedback)
function RequestDemoModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [lastSubmit, setLastSubmit] = useState(0)

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    website: "", // honeypot
  })

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "",
        website: "",
      })
      setStatus("idle")
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const validate = () => {
    if (form.website) return "Invalid submission"
    if (!form.name.trim()) return "Name is required"
    if (!form.email.trim()) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email"
    if (form.phone && !/^[\d\s+\-().]{10,20}$/.test(form.phone)) return "Enter a valid phone"
    if (!form.message.trim()) return "Please describe what you want to see"
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (Date.now() - lastSubmit < 5000) {
      setError("Please wait a few seconds before submitting again.")
      setStatus("error")
      return
    }
    const v = validate()
    if (v) {
      setError(v)
      setStatus("error")
      return
    }
    setStatus("submitting")
    setError(null)
    try {
      await submitFeedback(
        form.name.trim(),
        form.email.trim(),
        form.message.trim(),
        form.company.trim() || undefined,
        form.phone.trim() || undefined
      )
      setStatus("success")
      setLastSubmit(Date.now())
      setTimeout(onClose, 1600)
    } catch (err) {
      console.log(err as Error);
      setStatus("error")
      setError("Thanks! We’ve received your request. We’ll reach out shortly.")
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }
  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-[121] w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-blue-500/30 bg-[#0c1220] shadow-[0_0_60px_rgba(59,130,246,0.15),0_0_100px_rgba(59,130,246,0.08)]"
        onClick={handleModalClick}
      >
        {/* Top accent */}
        <div className="h-1 w-full shrink-0 rounded-t-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />
        <div className="flex flex-col flex-1 min-h-0 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold font-orbitron tracking-tight text-white">
                Request a 1:1 demo
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Tell us a bit about you. We’ll reach out with a personalized demo.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-4 flex flex-col flex-1 min-h-0">
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={onChange}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
            />

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-300">Full name *</label>
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="John Doe"
                    className="mt-1 w-full rounded-xl border border-blue-500/30 bg-slate-900/80 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Work email *</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="johndoe@company.com"
                    className="mt-1 w-full rounded-xl border border-blue-500/30 bg-slate-900/80 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-300">Company</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={onChange}
                    placeholder="Acme Manufacturing"
                    className="mt-1 w-full rounded-xl border border-blue-500/30 bg-slate-900/80 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="+1 (555) 555-5555"
                    className="mt-1 w-full rounded-xl border border-blue-500/30 bg-slate-900/80 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300">What do you want to see? *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={4}
                  placeholder="Share goals, current tools, timelines…"
                  className="mt-1 w-full rounded-xl border border-blue-500/30 bg-slate-900/80 px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500/50 resize-none"
                />
              </div>

              {status === "error" && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
                  {error}
                </div>
              )}
              {status === "success" && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
                  Thanks! We’ve received your request. We’ll reach out shortly.
                </div>
              )}
            </div>

            {/* Buttons - always visible at bottom */}
            <div className="flex items-center justify-end gap-3 pt-5 mt-4 shrink-0 border-t border-blue-500/20">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2.5 text-sm font-medium border border-blue-500/50 text-slate-300 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1220] disabled:opacity-50"
                disabled={status === "submitting"}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-cta-large rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1220]"
                disabled={status === "submitting" || status === "success"}
              >
                <span>{status === "submitting" ? "Submitting…" : "Submit"}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}
