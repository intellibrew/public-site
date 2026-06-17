"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { PenTool, Settings, Package } from "lucide-react";
import { ClientsLogoMarquee } from "@/components/sections/ClientsLogoMarquee";

const teams = [
  {
    icon: <PenTool className="h-5 w-5" />,
    title: "Design Engineers",
    items: ["Product integration", "Line specifications", "Technical drawings"],
  },
  {
    icon: <Settings className="h-5 w-5" />,
    title: "Industrial Engineering",
    items: ["Station design", "Cycle time modeling", "Layout iteration"],
  },
  {
    icon: <Package className="h-5 w-5" />,
    title: "Manufacturing Ops",
    items: ["RFQ packs", "Equipment selection", "Capacity & bottlenecks"],
  },
];

type CustomersClientsSectionProps = {
  embedded?: boolean;
};

export function CustomersClientsSection({ embedded = false }: CustomersClientsSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="customers"
      className={
        embedded
          ? "factory-scroll-panel factory-scroll-panel--customers relative flex h-full flex-col overflow-hidden bg-transparent"
          : "relative overflow-hidden bg-[#060608] py-24"
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

      <div
        className={
          embedded
            ? "factory-customers__shell relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-[calc(var(--site-header-total)+0.375rem)] md:px-6 md:py-[calc(var(--site-header-total)+0.75rem)]"
            : "relative z-10 mx-auto max-w-6xl px-6"
        }
      >
        <div className={embedded ? "factory-customers__main flex min-h-0 flex-1 flex-col justify-start md:justify-center" : ""}>
          <motion.div
            className={`flex justify-center ${embedded ? "mb-2 md:mb-3" : "mb-6"}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="shiny-badge">Customers</span>
          </motion.div>

          <motion.h2
            className={`factory-customers__heading text-center font-orbitron leading-[1.12] text-white ${
              embedded
                ? "mb-3 text-[24px] sm:text-[30px] md:mb-8 md:text-[48px] md:leading-tight"
                : "text-heading mb-16"
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Built for manufacturing <span className="text-primary">teams that ship.</span>
          </motion.h2>

          <div
            className={`factory-customers__cards grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-6 ${embedded ? "" : "mb-12"}`}
          >
            {teams.map((team, index) => (
              <motion.div
                key={team.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl border border-teal-500/20 ${embedded ? "p-3.5 md:p-6" : "p-6 md:p-8"}`}
                style={{
                  background:
                    "linear-gradient(180deg, rgba(12,12,14,0.95) 0%, rgba(6,6,8,0.98) 100%)",
                  boxShadow: "0 0 25px rgba(20,184,166,0.05)",
                }}
              >
                <div className="mb-2.5 flex items-center gap-2.5 md:mb-5 md:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/15 text-teal-400 md:h-10 md:w-10">
                    {team.icon}
                  </div>
                  <h3 className="font-orbitron text-[14px] leading-tight text-white md:text-[18px]">
                    {team.title}
                  </h3>
                </div>

                <ul className="space-y-1.5 md:space-y-3">
                  {team.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-[12px] text-teal-300/90 md:gap-3 md:text-[14px]">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div
          className={
            embedded
              ? "factory-customers__footer relative z-10 mt-3 shrink-0 border-t border-teal-500/10 pt-2.5 md:mt-6 md:pt-6"
              : "relative z-10 mt-12 border-t border-teal-500/10 pt-10"
          }
        >
          <motion.p
            className="mb-2 text-center text-xs italic text-slate-400 sm:mb-3 sm:text-sm md:mb-4 md:text-[15px]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            Trusted by engineers and manufacturers globally
          </motion.p>
          <div className={embedded ? "factory-customers__logos -mx-4 overflow-hidden md:mx-0" : undefined}>
            <ClientsLogoMarquee compact={embedded} visibilityRootRef={sectionRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
