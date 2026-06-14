"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { ClientsLogoMarquee } from "@/components/sections/ClientsLogoMarquee";

type ClientsSectionProps = {
  embedded?: boolean;
};

export function ClientsSection({ embedded = false }: ClientsSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="clients"
      className={
        embedded
          ? "factory-scroll-panel factory-scroll-panel--clients relative flex h-full flex-col overflow-hidden bg-transparent py-[calc(var(--site-header-total)+1rem)]"
          : "relative overflow-hidden bg-[#060608] py-12 sm:py-16 md:py-20"
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 55%)",
        }}
      />
      <div className={`relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 ${embedded ? "mb-4 md:mb-6" : "mb-6 md:mb-10"}`}>
        <motion.p
          className="text-center text-sm italic text-slate-400 sm:text-[16px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trusted by Engineers and Manufacturers globally
        </motion.p>
      </div>

      <div className={`relative z-10 w-full ${embedded ? "flex min-h-0 flex-1 items-center" : ""}`}>
        <ClientsLogoMarquee visibilityRootRef={sectionRef} />
      </div>
    </section>
  );
}
