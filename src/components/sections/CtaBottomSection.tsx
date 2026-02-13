"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
export function CtaBottomSection({ onBookDemo }: { onBookDemo?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="cta" className="relative py-24 md:py-40 overflow-hidden" data-testid="section-cta">
      <div className="absolute inset-0">
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-primary/8 blur-[200px] rounded-full animate-blob" />
        <div className="absolute top-[25%] left-1/4 w-[400px] h-[400px] bg-primary/5 blur-[150px] rounded-full animate-blob animation-delay-2000" />
        <div className="absolute top-[55%] right-1/4 w-[400px] h-[400px] bg-primary/5 blur-[150px] rounded-full animate-blob animation-delay-4000" />
        <div className="grid-bg absolute inset-0 opacity-10" />
      </div>

      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-6 text-center -translate-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-sm font-medium text-primary mb-8"
          >
            Ready to Transform?
          </motion.p>

          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6"
          >
            Plan the line in
            <br />
            <span className="gradient-text-animated">hours, not weeks</span>
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed"
          >
            Get a sample output pack and see what NeoFab generates from your inputs.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={onBookDemo}
              className="nav-demo-btn"
              data-testid="button-cta-demo"
            >
              <span>Book a Demo</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap"
          >
            <span className="flex items-center gap-2" data-testid="text-trust-cad">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Works with your CAD files
            </span>
            <span className="flex items-center gap-2" data-testid="text-trust-rfq">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              RFQ packs included
            </span>
            <span className="flex items-center gap-2" data-testid="text-trust-model">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Complete line model
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
