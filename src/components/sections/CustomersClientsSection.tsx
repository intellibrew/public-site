"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion";
import { NarrativeReveal } from "@/components/narrative/NarrativeReveal";
import { PersonaViz } from "@/components/narrative/PersonaViz";
import { JOURNEY } from "@/lib/factory/scrollJourney";

const personas = [
  {
    key: "design" as const,
    title: "Design Engineers",
    label: "product → line spec",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0-4-4L4 16v4" />
        <path d="M13.5 6.5l4 4" />
      </svg>
    ),
  },
  {
    key: "mechanical" as const,
    title: "Mechanical Engineering",
    label: "stations + line balance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.3 4.3c.4-1.8 2.9-1.8 3.4 0a1.7 1.7 0 0 0 2.5 1.1c1.6-.9 3.3.8 2.4 2.4a1.7 1.7 0 0 0 1 2.5c1.8.4 1.8 2.9 0 3.4a1.7 1.7 0 0 0-1 2.5c.9 1.6-.8 3.3-2.4 2.4a1.7 1.7 0 0 0-2.5 1c-.4 1.8-2.9 1.8-3.4 0a1.7 1.7 0 0 0-2.5-1c-1.6.9-3.3-.8-2.4-2.4a1.7 1.7 0 0 0-1-2.5c-1.8-.4-1.8-2.9 0-3.4a1.7 1.7 0 0 0 1-2.5c-.9-1.6.8-3.3 2.4-2.4 1 .6 2.2.1 2.5-1z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    key: "manufacturing" as const,
    title: "Manufacturing Ops",
    label: "RFQ packs + equipment",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
        <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </svg>
    ),
  },
];

type CustomersClientsSectionProps = {
  embedded?: boolean;
  scrollProgress?: MotionValue<number>;
};

export function CustomersClientsSection({
  embedded = false,
  scrollProgress,
}: CustomersClientsSectionProps = {}) {
  const idleProgress = useMotionValue(0);
  const progressSource = scrollProgress ?? idleProgress;
  const revealLatchedRef = useRef(false);
  const [revealActive, setRevealActive] = useState(false);
  const [revealCycle, setRevealCycle] = useState(0);

  useMotionValueEvent(progressSource, "change", (p) => {
    if (!embedded || !scrollProgress) return;

    if (p >= JOURNEY.customers.fadeIn[0]) {
      if (!revealLatchedRef.current) {
        revealLatchedRef.current = true;
        setRevealCycle((c) => c + 1);
        setRevealActive(true);
      }
    } else if (p < JOURNEY.customers.fadeIn[0] - 0.03) {
      revealLatchedRef.current = false;
      setRevealActive(false);
    }
  });

  useEffect(() => {
    if (!embedded || !scrollProgress) {
      setRevealActive(true);
    }
  }, [embedded, scrollProgress]);

  const slideClass = `factory-narrative-slide factory-narrative-slide--teams factory-narrative ${
    revealActive ? "factory-narrative-slide--in" : ""
  }`;

  const content = (
    <>
      <NarrativeReveal delay={0}>
        <div className="factory-narrative-eyebrow">Who it serves</div>
      </NarrativeReveal>

      <NarrativeReveal delay={1}>
        <h2 className="factory-narrative-headline">
          Built for the teams that <span className="factory-narrative-accent">ship.</span>
        </h2>
      </NarrativeReveal>

      <NarrativeReveal delay={2}>
        <div className="factory-narrative-personas">
          {personas.map((persona) => (
            <div key={persona.key} className="factory-narrative-persona">
              <div className="factory-narrative-persona-icon" aria-hidden="true">
                {persona.icon}
              </div>
              <h3>{persona.title}</h3>
              <div className="factory-narrative-persona-label">{persona.label}</div>
              <PersonaViz variant={persona.key} />
            </div>
          ))}
        </div>
      </NarrativeReveal>
    </>
  );

  if (embedded) {
    return (
      <section
        id="customers"
        className="factory-scroll-panel factory-scroll-panel--customers factory-narrative relative flex h-full flex-col overflow-hidden bg-transparent"
      >
        <div
          key={`customers-${revealCycle}`}
          className={`${slideClass} relative z-10 mx-auto w-full max-w-7xl min-h-0 flex-1`}
        >
          {content}
        </div>
      </section>
    );
  }

  return (
    <section id="customers" className="factory-narrative relative overflow-hidden bg-[#060608] py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 55%)",
        }}
      />
      <div className={`${slideClass} relative z-10 mx-auto max-w-7xl px-6 md:px-10`}>{content}</div>
    </section>
  );
}
