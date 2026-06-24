"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import Beams from "@/components/Beams";
import { ClientsLogoMarquee } from "@/components/sections/ClientsLogoMarquee";
import { NarrativeReveal } from "@/components/narrative/NarrativeReveal";
import { isCompactViewport } from "@/lib/layoutBreakpoints";
import { JOURNEY } from "@/lib/factory/scrollJourney";

type FactoryContactSectionProps = {
  embedded?: boolean;
  scrollProgress?: MotionValue<number>;
};

export default function FactoryContactSection({
  embedded = false,
  scrollProgress,
}: FactoryContactSectionProps) {
  const [revealActive, setRevealActive] = useState(false);
  const [contactCycle, setContactCycle] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const [contactBeamsActive, setContactBeamsActive] = useState(false);
  const revealLatchedRef = useRef(false);

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.45, once: false });
  const idleProgress = useMotionValue(0);
  const progressSource = scrollProgress ?? idleProgress;

  useMotionValueEvent(progressSource, "change", (p) => {
    if (!embedded || !scrollProgress) return;
    setContactBeamsActive(p >= JOURNEY.customers.fadeIn[0] - 0.02);
    if (p >= JOURNEY.contact.fadeIn[0]) {
      if (!revealLatchedRef.current) {
        revealLatchedRef.current = true;
        setContactCycle((c) => c + 1);
        setRevealActive(true);
      }
    } else if (p < JOURNEY.contact.fadeIn[0] - 0.03) {
      revealLatchedRef.current = false;
      setRevealActive(false);
    }
  });

  useEffect(() => {
    if (!embedded || !scrollProgress) return;
    setContactBeamsActive(scrollProgress.get() >= JOURNEY.customers.fadeIn[0] - 0.02);
  }, [embedded, scrollProgress]);

  useEffect(() => {
    if (embedded && scrollProgress) return;
    setRevealActive(inView);
  }, [embedded, inView, scrollProgress]);

  useEffect(() => {
    const check = () => setIsCompact(isCompactViewport());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const beamsActive = embedded ? contactBeamsActive : inView;
  const slideClass = `factory-narrative-slide factory-narrative ${
    revealActive ? "factory-narrative-slide--in" : ""
  }`;

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={
        embedded
          ? "factory-scroll-panel factory-scroll-panel--contact factory-contact-finale factory-narrative relative flex h-full flex-col items-center justify-center overflow-hidden"
          : "factory-contact-section factory-contact-finale factory-narrative relative overflow-hidden py-24 md:py-28"
      }
    >
      <div aria-hidden className="hero-beams-layer absolute inset-0 z-0 opacity-70">
        <Beams
          active={beamsActive}
          beamWidth={isCompact ? 2.5 : 3}
          beamHeight={isCompact ? 26 : 30}
          beamNumber={isCompact ? 16 : 20}
          lightColor="#22c59d"
          speed={2}
          noiseIntensity={isCompact ? 0.75 : 1.75}
          scale={isCompact ? 0.18 : 0.2}
          rotation={30}
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,7,8,0.28)_48%,#050708_88%)]"
      />

      <div
        key={`contact-${contactCycle}`}
        className={`${slideClass} relative z-10 mx-auto w-full max-w-4xl ${
          embedded ? "py-[calc(var(--site-header-total)+1rem)]" : ""
        }`}
      >
        <NarrativeReveal delay={0}>
          <div className="factory-narrative-eyebrow">Get started</div>
        </NarrativeReveal>

        <NarrativeReveal delay={1}>
          <h2 className="factory-narrative-headline">
            Plan your factory in <span className="factory-narrative-accent">hours.</span>
          </h2>
        </NarrativeReveal>

        <NarrativeReveal delay={2}>
          <p className="factory-narrative-subhead">
            Get a sample output pack and see what NeoFab builds from your inputs.
          </p>
        </NarrativeReveal>

        <NarrativeReveal delay={3}>
          <a href="mailto:Hello@neofab.ai" className="factory-narrative-cta" title="Contact us: Hello@neofab.ai">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            Contact us: Hello@neofab.ai
          </a>
        </NarrativeReveal>

        <NarrativeReveal delay={4}>
          <div
            className={
              embedded
                ? "factory-contact__trusted relative z-10 mt-16 w-full max-w-7xl shrink-0 border-t border-white/[0.07] pt-8 md:mt-16 md:pt-9 lg:px-4"
                : "relative z-10 mt-16 w-full max-w-7xl border-t border-white/[0.07] pt-10"
            }
          >
            <motion.p
              className="mb-2 text-center font-body text-sm italic text-[var(--narrative-muted)] sm:mb-3 md:mb-4"
              initial={embedded ? false : { opacity: 0, y: 16 }}
              whileInView={embedded ? undefined : { opacity: 1, y: 0 }}
              viewport={embedded ? undefined : { once: true }}
              transition={embedded ? undefined : { duration: 0.45, delay: 0.1 }}
            >
              Trusted by engineers and manufacturers globally
            </motion.p>
            <div className={embedded ? "factory-contact__logos -mx-4 overflow-hidden md:mx-0" : undefined}>
              <ClientsLogoMarquee compact={embedded} visibilityRootRef={sectionRef} />
            </div>
          </div>
        </NarrativeReveal>
      </div>
    </section>
  );
}
