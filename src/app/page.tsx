"use client"
import Link from "next/link"
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
} from "lucide-react"
import { submitFeedback } from "../app/api_requests/feedback"

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

const TRUSTED_BY = [
  { name: "Emo Energy", url: "https://www.emoenergy.in" },
  { name: "Seurat", url: "https://www.seurat.com" },
  { name: "One.AI", url: "https://one.ai" },
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

  // Demo card copy (now includes per-card image)
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
      <header className="sticky top-0 z-[80] isolate w-full bg-white/75 backdrop-blur-xl ring-1 ring-zinc-200/70">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="#product"
              aria-label="NeoFab home"
              className="shrink-0 font-bold tracking-tight text-[1.5rem] md:text-[1.7rem] hover:brand-glow"
            >
              <span className="text-zinc-900">NeoFab </span>
              <span className="brand-ai">AI</span>
            </Link>

            <div className="flex items-center gap-3">
              <nav
                aria-label="Primary"
                className="hidden md:flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-1 ring-1 ring-zinc-200 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.35)]"
              >
                {[
                  ["Demo", "#demos"],
                  ["Features", "#features"],
                  ["FAQ", "#faq"],
                  ["Contact", "#contact"],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    className="rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:glow-text transition"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <Button className="neo-btn" onClick={() => setDemoOpen(true)}>
                Schedule a demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

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
            <div className="relative mx-auto max-w-[1200px] px-6 py-16 text-center sm:px-10 md:py-24 lg:py-28">
              <AnimateInView delay={30}>
                <h1 className="glow-header text-[44px] leading-[1.06] font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent">
                  The Future of Manufacturing
                </h1>
              </AnimateInView>
              <AnimateInView delay={120}>
                <p className="mx-auto mt-5 max-w-3xl text-lg md:text-xl text-zinc-700">
                  From concept to factory floor, NeoFab <span className="font-semibold">AI</span> transforms
                  designs into optimized layouts that power faster, smarter manufacturing.
                </p>
              </AnimateInView>
              <AnimateInView delay={180}>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild className="neo-btn">
                    <a
                      href="https://app.neofab.ai/login"
                      target="_blank"
                    >
                      Get started <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" className="neo-btn-outline">
                    Explore live demo
                  </Button>
                </div>
              </AnimateInView>

            </div>
          </div>
          <div
            aria-hidden
            className="mx-auto mt-10 h-48 max-w-6xl rounded-[44px] bg-[radial-gradient(1200px_260px_at_50%_0%,rgba(56,189,248,0.24),transparent_60%)]"
          />
        </section>

        {/* Three-step flow */}
        <section id="flow" className="mx-auto max-w-7xl px-4 pt-8">
          <AnimateInView>
            <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight hover:glow-text">
              Where Planning Meets Production - Instantly
            </h2>
          </AnimateInView>

          {/* static connector bar */}
          <div
            aria-hidden
            className="relative mx-auto mt-10 hidden h-[6px] w-full max-w-5xl rounded-full bg-gradient-to-r from-indigo-200 via-sky-200 to-cyan-200 md:block"
          />

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <FlowCard
              index="1."
              title="Input"
              bullets={[
                "Product specifications",
                "Facility constraints",
                "Budget & quality goals",
                "Target production volumes",
              ]}
            />
            <FlowCard
              index="2."
              title="Fab Inference"
              bullets={[
                "Smart workflow design",
                "AI-driven machine selection",
                "Optimized layouts for efficiency",
                "Cost modeling & built-in quality controls",
              ]}
            />
            <FlowCard
              index="3."
              title="Output"
              bullets={[
                "Ready-to-use factory layout",
                "Curated machine purchase list",
                "Vendor matchmaking & instant RFQs",
                "Compliance packs & project management handoff",
              ]}
            />
          </div>
        </section>

        {/* Demo cards + hover preview */}
        <section
          id="demos"
          className="mx-auto max-w-7xl px-4 pt-20 md:pt-28 pb-6 scroll-mt-28"
        >
          <AnimateInView>
            <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight hover:glow-text">
              See NeoFab in Action
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-600">
              Three moments that collapse months of planning into minutes.
            </p>
          </AnimateInView>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {DEMOS.map((d, i) => (
              <DemoCard
                key={d.title}
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

        {/* Logos / trust */}
        <section className="mx-auto max-w-7xl px-4 pt-4 pb-24">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)]">
            <div className="text-center text-xs uppercase tracking-widest text-zinc-500">
              Trusted by people at
            </div>
            <div className="mt-5 grid grid-cols-1 items-center justify-items-center gap-6 sm:grid-cols-3">
              {TRUSTED_BY.map((c) => (
                <a
                  key={c.name}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-white hover:shadow-[0_18px_60px_-24px_rgba(2,132,199,0.25)] transition"
                >
                  <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent">
                    {c.name}
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 transition" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="py-24 bg-[linear-gradient(180deg,#F6FAFF_0%,#FFFFFF_100%)]"
        >
          <div className="mx-auto max-w-4xl px-4">
            <SectionHeader eyebrow="FAQ" title="Answers to real questions" />
            <div className="mt-8 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
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
                <details key={i} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-base font-medium">
                    {f.q}
                    <span className="ml-4 rounded-full border border-zinc-300 px-2 text-xs text-zinc-600 group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <p className="pb-4 text-zinc-600">{f.a}</p>
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
              <Button variant="outline" onClick={() => setDemoOpen(true)} className="neo-btn-outline">
                Contact sales
              </Button>
            </div>
          </div>
        </section>

        {/* Demo request modal */}
        <RequestDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-[1.05rem]">
                NeoFab <span className="brand-ai">AI</span>
              </span>
              <span className="text-sm text-zinc-600">
                © {new Date().getFullYear()} NeoFab. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-600">
              <a href="#flow" className="hover:glow-text">Flow</a>
              <a href="#features" className="hover:glow-text">Features</a>
              <a href="#faq" className="hover:glow-text">FAQ</a>
              <a href="#contact" className="hover:glow-text">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Inline styles for glow/background/buttons */}
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
        .brand-glow {
          text-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
        }
        .glow-header:hover {
          text-shadow: 0 0 28px rgba(56, 189, 248, 0.35);
        }
        .hover\\:glow-text:hover {
          text-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
        }

        /* Background glows (static) */
        .bg-balls {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
        }
        .ball {
          position: absolute;
          border-radius: 9999px;
          filter: blur(42px);
          opacity: 0.65;
          transform: translateZ(0);
        }
        .ball-1 {
          top: 8%;
          left: 12%;
          width: 22rem;
          height: 22rem;
          background: radial-gradient(
            closest-side,
            rgba(99, 102, 241, 0.45),
            rgba(14, 165, 233, 0.35),
            rgba(8, 145, 178, 0.22),
            transparent 70%
          );
        }
        .ball-2 {
          top: 52%;
          right: 8%;
          width: 26rem;
          height: 26rem;
          background: radial-gradient(
            closest-side,
            rgba(14, 165, 233, 0.35),
            rgba(56, 189, 248, 0.3),
            rgba(99, 102, 241, 0.22),
            transparent 70%
          );
        }
        .ball-3 {
          bottom: 6%;
          left: 28%;
          width: 24rem;
          height: 24rem;
          background: radial-gradient(
            closest-side,
            rgba(56, 189, 248, 0.3),
            rgba(14, 165, 233, 0.26),
            rgba(99, 102, 241, 0.18),
            transparent 70%
          );
        }

        /* Soft hero glow */
        .hero-soft-glow {
          position: absolute;
          inset: -20% -10% -30% -10%;
          pointer-events: none;
          background:
            radial-gradient(40% 32% at 20% 22%, rgba(99, 102, 241, 0.22), transparent 60%),
            radial-gradient(52% 38% at 78% 18%, rgba(56, 189, 248, 0.24), transparent 60%),
            radial-gradient(48% 36% at 42% 82%, rgba(6, 182, 212, 0.22), transparent 60%);
          filter: blur(34px);
          opacity: 0.9;
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
        .neo-btn:hover {
          filter: saturate(115%) brightness(1.02);
          transform: translateY(-1px);
        }
        .neo-btn:before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: 9999px;
          background: conic-gradient(
            from 180deg,
            rgba(199, 210, 254, 0.45),
            rgba(186, 230, 253, 0.65),
            rgba(165, 243, 252, 0.45),
            rgba(199, 210, 254, 0.45)
          );
          filter: blur(8px);
          z-index: -1;
          animation: borderGlow 4.5s linear infinite;
        }
        @keyframes borderGlow {
          to {
            transform: rotate(360deg);
          }
        }

        .neo-btn-outline {
          position: relative;
          color: #0b1220;
          border-radius: 9999px;
          background: white;
          box-shadow: 0 10px 32px -18px rgba(2, 132, 199, 0.25);
        }
        .neo-btn-outline:before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(90deg, #c7d2fe, #bae6fd, #a5f3fc);
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: outlineShift 6s linear infinite;
        }
        @keyframes outlineShift {
          to {
            filter: hue-rotate(360deg);
          }
        }

        /* Demo card sheen */
        .sheen {
          content: "";
          position: absolute;
          inset: 0;
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
        .demo-card:hover .sheen {
          transform: translateX(150%) rotate(0.001deg);
        }

        /* Subtle halo motion used on a few cards */
        @keyframes halo {
          0%, 100% {
            opacity: 0.28;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.06);
          }
        }
      `}</style>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

// Static background with three radial glows
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
  index,
  title,
  bullets,
}: {
  index: string
  title: string
  bullets: string[]
}) {
  return (
    <AnimateInView>
      <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/85 bg-white/90 p-6 backdrop-blur ring-1 ring-white shadow-[0_36px_120px_-44px_rgba(15,23,42,0.3)] transition hover:shadow-[0_44px_160px_-52px_rgba(2,132,199,0.33)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-16 -z-10 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,102,241,0.14),rgba(56,189,248,0.14),rgba(6,182,212,0.14),transparent,transparent,rgba(99,102,241,0.14))] blur-2xl animate-[halo_11s_ease-in-out_infinite]"
        />
        <div className="mb-3 flex items-center gap-3">
          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-xs font-medium">
            {index}
          </div>
          <div className="text-sm font-semibold tracking-wide">{title}</div>
        </div>
        <ul className="mt-2 space-y-2 text-sm text-zinc-700">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </AnimateInView>
  )
}

function DemoCard({
  title,
  caption,
  imageAlt,
  imageSrc,
  onEnter,
  onLeave,
}: {
  title: string
  caption: string
  imageAlt: string
  imageSrc: string
  onEnter?: () => void
  onLeave?: () => void
}) {
  return (
    <AnimateInView>
      <article
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="demo-card group relative overflow-hidden rounded-2xl border border-zinc-200/85 bg-white/90 backdrop-blur ring-1 ring-white shadow-[0_36px_120px_-44px_rgba(15,23,42,0.3)] transition hover:shadow-[0_48px_180px_-56px_rgba(2,132,199,0.35)]"
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
            className="h-auto w-full scale-[1.01] transform-gpu transition duration-500 group-hover:scale-[1.03] object-cover"
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

// Fixed overlay preview that fades in when a demo card is hovered
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

  // form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    website: "", // honeypot
  })

  // close on ESC
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
    } catch (err: any) {
      setStatus("error")
      setError("Failed to submit. Please try again.")
    }
  }

  if (!open) return null

  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-[121] w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_40px_140px_-50px_rgba(2,132,199,0.35)]">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-600" />
        <div className="p-6">
          <h3 className="text-xl font-semibold tracking-tight">Request a 1:1 demo</h3>
          <p className="mt-1 text-sm text-zinc-600">
            Tell us a bit about you. We’ll reach out with a personalized demo.
          </p>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            {/* Honeypot */}
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
                  placeholder="Priya Singh"
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
                  placeholder="priya@company.com"
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
                  placeholder="+91 98xxxxxxx"
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
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error || "Something went wrong. Please try again."}
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
