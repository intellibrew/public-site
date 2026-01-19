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
      "AI maps process steps and machine options for takt, throughput, and yield — no spreadsheets, no guesswork.",
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
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-0 z-[90] h-1">
        <div
          className="h-full w-0 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Static background glows */}
      <BackgroundBalls />

      {/* Header */}
      <Header />

      {/* Main */}
      <main className="scroll-mt-24">
        {/* Hero */}
        <section id="product" className="mx-auto max-w-7xl px-4 pt-6 md:pt-10">
          <div
            className={cn(
              "relative overflow-hidden rounded-[36px] border",
              "border-zinc-200/80 bg-white/85 backdrop-blur-md",
              "shadow-[0_60px_160px_-60px_rgba(30,58,138,0.28),0_24px_72px_-36px_rgba(2,132,199,0.26)]"
            )}
          >
            {/* soft hero glow */}
            <div className="hero-soft-glow" aria-hidden />
            <div className="relative mx-auto max-w-[1200px] px-6 py-20 text-center sm:px-10 md:py-32 lg:py-36">
              <AnimateInView delay={30}>
                <h1 className="glow-header text-[44px] leading-[1.06] font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent">
                  The Future of Manufacturing
                </h1>
              </AnimateInView>
              <AnimateInView delay={120}>
                <p className="mx-auto mt-6 max-w-3xl text-lg md:text-xl text-zinc-700 leading-relaxed">
                  From concept to factory floor, NeoFab <span className="font-semibold">AI</span> transforms
                  designs into optimized layouts that power faster, smarter manufacturing.
                </p>
              </AnimateInView>
            </div>
          </div>
          <div
            aria-hidden
            className="mx-auto mt-10 h-48 max-w-6xl rounded-[44px] bg-[radial-gradient(1200px_260px_at_50%_0%,rgba(56,189,248,0.24),transparent_60%)]"
          />
        </section>

        {/* Flow — pulled up; icon badges */}
        <section id="flow" className="mx-auto max-w-7xl px-4 -mt-6 md:-mt-8 pt-4">
          <AnimateInView>
            <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight hover:glow-text">
              Where Planning Meets Production - Instantly
            </h2>
          </AnimateInView>

          <div className="mt-7 md:mt-9 grid gap-5 md:grid-cols-3">
            <FlowCard
              title="Input"
              icon={<Layers className="h-5 w-5 text-sky-600" />}
              bullets={[
                "Product specifications",
                "Facility constraints",
                "Budget & quality goals",
                "Target production volumes",
              ]}
            />
            <FlowCard
              title="Fab Inference"
              icon={<Network className="h-5 w-5 text-indigo-600" />}
              bullets={[
                "Smart workflow design",
                "AI-driven machine selection",
                "Optimized layouts for efficiency",
                "Cost modeling & built-in quality controls",
              ]}
            />
            <FlowCard
              title="Output"
              icon={<LineChart className="h-5 w-5 text-cyan-600" />}
              bullets={[
                "Ready-to-use factory layout",
                "Curated machine purchase list",
                "Vendor matchmaking & instant RFQs",
                "Compliance packs & project management handoff",
              ]}
            />
          </div>
        </section>

        {/* ABOUT — simple, no paragraph animations; gradient background behind text */}
        <section id="about" className="mx-auto max-w-7xl px-4 pt-14 md:pt-18">
          <div
            className="
              relative overflow-hidden rounded-[36px] border
              border-zinc-200/80 bg-white/85 backdrop-blur-md
              shadow-[0_60px_160px_-60px_rgba(30,58,138,0.18),0_24px_72px_-36px_rgba(2,132,199,0.16)]
            "
          >
            {/* soft static gradient behind the paragraphs */}
            <div
              aria-hidden
              className="
                absolute inset-0 -z-10
                bg-[radial-gradient(700px_300px_at_15%_10%,rgba(99,102,241,0.10),transparent_60%),radial-gradient(800px_320px_at_85%_8%,rgba(56,189,248,0.10),transparent_65%),radial-gradient(700px_280px_at_50%_100%,rgba(6,182,212,0.10),transparent_70%)]
                blur-[2px]
              "
            />
            <div className="px-6 py-10 md:px-10 md:py-14">
              <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight">
                About NeoFab <span className="brand-ai">AI</span>
              </h2>
              <div
                aria-hidden
                className="mx-auto mt-3 h-1.5 w-28 md:w-40 rounded-full bg-gradient-to-r from-indigo-200 via-sky-200 to-cyan-200"
              />
              <div className="mx-auto mt-8 max-w-4xl text-zinc-700 text-lg md:text-xl leading-[1.75] space-y-5">
                <p>
                  NeoFabAI is an end-to-end software solution for modern manufacturers looking to scale
                  quickly and efficiently. Founded by three entrepreneurs with backgrounds in engineering,
                  AI and management, NeoFabAI represents a revolution in manufacturing planning and execution.
                </p>
                <p>
                  Our platform allows companies to upload their designs and drawings to instantly generate
                  full-scale factory layouts and detailed execution plans. This innovation reduces the time
                  and cost of scaling production, making it a game-changer for startups and established
                  manufacturers alike.
                </p>
                <p>
                  What sets NeoFabAI apart is its comprehensive approach - we support manufacturers from start
                  to finish with plans, suppliers, layouts and even become the Manufacturing Execution System
                  (MES) once the factory is operational, creating a continuous improvement cycle.
                </p>
                <p className="font-semibold text-[#203a43]">
                  What a team of 5 would take 4 weeks to accomplish, NeoFabAI can deliver in just 30 minutes -
                  with higher precision and greater detail.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo cards + hover preview */}
        <section
          id="demos"
          className="mx-auto max-w-7xl px-4 pt-20 md:pt-24 pb-6 scroll-mt-28"
        >
          <AnimateInView>
            <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight hover:glow-text">
              See NeoFab in Action
            </h2>
          </AnimateInView>
          <div aria-hidden className="mx-auto mt-3 h-1.5 w-40 md:w-56 rounded-full animated-underline" />
          <AnimateInView delay={80}>
            <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-600">
              Three moments that collapse months of planning into minutes.
            </p>
          </AnimateInView>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {DEMOS.map((d, i) => (
              <DemoCard
                key={d.title}
                index={i}
                title={d.title}
                caption={d.caption}
                imageAlt={d.alt}
                imageSrc={d.image}
                onEnter={() => onDemoEnter(i)}
                onLeave={onDemoLeave}
              />
            ))}
          </div>

          <HoverPreview
            active={hoveredDemo !== null}
            title={hoveredDemo !== null ? DEMOS[hoveredDemo].title : ""}
            imageSrc={hoveredDemo !== null ? DEMOS[hoveredDemo].image : undefined}
          />
        </section>

        {/* Features */}
        <section
          id="features"
          className="relative mx-auto max-w-7xl px-4 py-24 scroll-mt-28"
        >
          <div aria-hidden className="absolute inset-0 -z-10 grid place-items-center">
            <div className="h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22),rgba(56,189,248,0.2),transparent)] blur-3xl" />
          </div>

          <SectionHeader
            eyebrow="Why NeoFab"
            title="Innovations That Power the Factory of Tomorrow"
          />

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} item={f} index={i} />
            ))}
          </div>
        </section>

        {/* FAQ (upgraded animated accordion) */}
        <section id="faq" className="py-24 bg-[linear-gradient(180deg,#F6FAFF_0%,#FFFFFF_100%)]">
          <div className="mx-auto max-w-4xl px-4">
            {/* 🔁 Updated heading text here */}
            <SectionHeader eyebrow="FAQ" title="Your questions, answered" />

            <div className="mt-8 space-y-4">
              {[
                {
                  q: "How accurate are the layouts NeoFab generates?",
                  a: "Layouts are based on CAD inputs, OEM datasheets, and verified supplier data. Every output is traceable and benchmarked against industry standards.",
                },
                {
                  q: "Can NeoFab optimize an existing factory setup?",
                  a: "Yes. Upload your current layouts or machine lists, and NeoFab will suggest workflow improvements, utilization boosts, and alternate configurations.",
                },
                {
                  q: "How much time does it save compared to traditional planning?",
                  a: "Factory setups that normally take 12–18 months can be completed in 3–6 months. Layout generation drops from weeks to under an hour.",
                },
                {
                  q: "What kind of products or industries does NeoFab support?",
                  a: "NeoFab is industry-agnostic and works across electronics, batteries, automotive, and other manufacturing verticals.",
                },
                {
                  q: "How does NeoFab help reduce costs?",
                  a: "By automating planning, vendor selection, and layout optimization, companies cut setup costs by up to 50%.",
                },
              ].map((f, i) => (
                <details key={i} className="faq-item group">
                  <summary className="faq-summary">
                    <span className="faq-left">
                      <span className="q-icon">
                        <HelpCircle className="h-4 w-4 text-sky-700/80" />
                      </span>
                      <span className="q-text">{f.q}</span>
                    </span>

                    {/* ✅ Tailwind-only icon swap (no custom CSS needed) */}
                    <span className="relative grid h-6 w-6 place-items-center">
                      <PlusCircle className="h-5 w-5 text-sky-600 transition-all duration-300 group-open:opacity-0 group-open:scale-75" />
                      <MinusCircle className="absolute h-5 w-5 text-sky-600 opacity-0 scale-75 transition-all duration-300 group-open:opacity-100 group-open:scale-100" />
                    </span>
                  </summary>

                  <div className="faq-content">
                    <div className="faq-inner">
                      <p className="text-zinc-600">{f.a}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="contact" className="mx-auto max-w-7xl px-4 py-24">
          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-[#F7FAFF] p-10 text-center shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)]">
            <h3 className="text-3xl font-bold tracking-tight hover:glow-text">
              Build your factory faster
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
              Join teams using NeoFab to scale production with confidence. No
              more scattered PDFs or guesswork.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button className="neo-btn" onClick={() => setDemoOpen(true)}>Request a demo</Button>
              
            </div>
          </div>
        </section>

        {/* Demo request modal */}
        <RequestDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      </main>

      {/* Footer */}
      <Footer />

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

        /* Typography rhythm */
        h2 { line-height: 1.12; }
        p, li { line-height: 1.5; }

        /* =========================
           FAQ – animated accordion
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

  if (!open) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  return (
    <div 
      aria-modal="true" 
      role="dialog" 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]" 
        onClick={handleBackdropClick}
      />
      <div 
        className="relative z-[121] w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_40px_140px_-50px_rgba(2,132,199,0.35)]"
        onClick={handleModalClick}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600" />
        <div className="p-6">
          <h3 className="text-xl font-semibold tracking-tight">Request a 1:1 demo</h3>
          <p className="mt-1 text-sm text-zinc-600">
            Tell us a bit about you. We’ll reach out with a personalized demo.
          </p>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Full name *</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="John Doe"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Work email *</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="johndoe@company.com"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Company</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={onChange}
                  placeholder="Acme Manufacturing"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+1 (555) 555-5555"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">What do you want to see? *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={4}
                placeholder="Share goals, current tools, timelines…"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {status === "error" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {error || "Thanks! We’ve received your request. We’ll reach out shortly."}
              </div>
            )}
            {status === "success" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Thanks! We’ve received your request. We’ll reach out shortly.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="neo-btn-outline rounded-full px-4 py-2 text-sm"
                disabled={status === "submitting"}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="neo-btn rounded-full px-5 py-2 text-sm"
                disabled={status === "submitting" || status === "success"}
              >
                {status === "submitting" ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
