"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import DemoRequestModal from "@/components/DemoRequestModal";

type FactoryContactSectionProps = {
  embedded?: boolean;
};

const STANDALONE_MOTION = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.55 },
  transition: { duration: 0.55 },
} as const;

export default function FactoryContactSection({ embedded = false }: FactoryContactSectionProps) {
  const [demoOpen, setDemoOpen] = useState(false);
  const closeDemo = useCallback(() => setDemoOpen(false), []);
  const openDemo = useCallback(() => setDemoOpen(true), []);

  return (
    <>
      <section
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
          <motion.h2
            className="text-heading mb-5 font-orbitron md:mb-6"
            {...(embedded ? {} : STANDALONE_MOTION)}
          >
            Plan your factory <span className="text-primary">in hours.</span>
          </motion.h2>

          <motion.p
            className="text-body mx-auto mb-10 max-w-xl md:mb-12"
            {...(embedded ? {} : { ...STANDALONE_MOTION, transition: { duration: 0.55, delay: 0.08 } })}
          >
            Get a sample output pack and see what NeoFab generates from your inputs.
          </motion.p>

          <motion.div
            className="factory-contact-cta-wrap"
            {...(embedded ? {} : { ...STANDALONE_MOTION, transition: { duration: 0.55, delay: 0.16 } })}
          >
            <button
              type="button"
              className="btn-cta-large btn-pulse inline-flex"
              aria-label="Book a demo"
              onClick={openDemo}
            >
              <span>Book a demo</span>
            </button>
          </motion.div>
        </div>
      </section>

      <DemoRequestModal open={demoOpen} onClose={closeDemo} />
    </>
  );
}
