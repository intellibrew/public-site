"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import FactoryContactCue from "@/components/FactoryContactCue";
import { MaskedTextReveal } from "@/components/motion/MaskedTextReveal";
import { TextRevealAuto } from "@/components/motion/TextRevealAuto";
import { JOURNEY } from "@/lib/factory/scrollJourney";

type FactoryContactSectionProps = {
  embedded?: boolean;
  scrollProgress?: MotionValue<number>;
};

const MUTED = "#475569";
const BODY = "#94a3b8";

export default function FactoryContactSection({
  embedded = false,
  scrollProgress,
}: FactoryContactSectionProps) {
  const [headingActive, setHeadingActive] = useState(false);
  const [subtextActive, setSubtextActive] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [contactCycle, setContactCycle] = useState(0);
  const headingLatchedRef = useRef(false);
  const prevHeadingActive = useRef(false);

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.45, once: false });
  const idleProgress = useMotionValue(0);
  const progressSource = scrollProgress ?? idleProgress;

  useMotionValueEvent(progressSource, "change", (p) => {
    if (!embedded || !scrollProgress) return;
    if (p >= JOURNEY.contact.fadeIn[0]) {
      if (!headingLatchedRef.current) {
        headingLatchedRef.current = true;
        setHeadingActive(true);
      }
    } else if (p < JOURNEY.contact.fadeIn[0] - 0.03) {
      headingLatchedRef.current = false;
      setHeadingActive(false);
      setSubtextActive(false);
      setCtaVisible(false);
      prevHeadingActive.current = false;
    }
  });

  useEffect(() => {
    if (embedded && scrollProgress) return;
    setHeadingActive(inView);
  }, [embedded, inView, scrollProgress]);

  useEffect(() => {
    if (!headingActive) {
      setSubtextActive(false);
      setCtaVisible(false);
      prevHeadingActive.current = false;
      return;
    }
    if (!prevHeadingActive.current) {
      setContactCycle((c) => c + 1);
    }
    prevHeadingActive.current = true;
    setSubtextActive(true);
    const ctaTimer = setTimeout(() => setCtaVisible(true), 320);
    return () => {
      clearTimeout(ctaTimer);
    };
  }, [headingActive]);

  const headingTransition = {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1] as number[],
  };

  return (
    <>
      <section
        ref={sectionRef}
        id="contact"
        className={
          embedded
            ? "factory-scroll-panel factory-scroll-panel--contact factory-contact-finale relative h-full overflow-hidden"
            : "factory-contact-section factory-contact-finale relative overflow-hidden py-24 md:py-28"
        }
      >
        <div
          className={`relative z-10 mx-auto w-full max-w-4xl px-6 text-center ${
            embedded
              ? "flex h-full flex-col items-center justify-center py-[calc(var(--site-header-total)+1rem)]"
              : ""
          }`}
        >
          <div className="mb-5 flex flex-col items-center md:mb-6" key={`contact-heading-${contactCycle}`}>
            <MaskedTextReveal
              as="span"
              text="Plan your factory"
              align="center"
              className="text-heading block font-orbitron text-white"
              active={headingActive}
              fromY={40}
              rotateFrom={0}
              stagger={0.05}
              transition={{ ...headingTransition, delay: 0.02 }}
            />
            <span className="flex flex-wrap justify-center gap-x-[0.28em]">
              <MaskedTextReveal
                as="span"
                text="in"
                align="center"
                className="text-heading font-orbitron text-white"
                active={headingActive}
                fromY={40}
                rotateFrom={0}
                stagger={0.05}
                transition={{ ...headingTransition, delay: 0.1 }}
              />
              <MaskedTextReveal
                as="span"
                text="hours."
                align="center"
                className="text-heading font-orbitron !text-primary"
                active={headingActive}
                fromY={40}
                rotateFrom={0}
                stagger={0.05}
                transition={{ ...headingTransition, delay: 0.14 }}
              />
            </span>
          </div>

          <TextRevealAuto
            key={`contact-subtext-${contactCycle}`}
            text="Get a sample output pack and see what NeoFab generates from your inputs."
            className="text-body mx-auto mb-10 max-w-xl md:mb-12"
            mutedColor={MUTED}
            primaryColor={BODY}
            active={subtextActive}
            delay={0}
            stagger={0.022}
            duration={0.2}
          />

          <motion.div
            className="flex w-full flex-col items-center gap-6 md:gap-8"
            initial={{ opacity: 0, y: 16 }}
            animate={ctaVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <FactoryContactCue inline />
          </motion.div>
        </div>
      </section>
    </>
  );
}
