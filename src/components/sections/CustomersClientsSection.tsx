"use client";

import { motion } from "framer-motion";
import { PenTool, Settings, Package } from "lucide-react";

const teams = [
  {
    icon: <PenTool className="h-5 w-5" />,
    title: "Design Engineers",
    items: ["Product integration", "Line specifications"],
  },
  {
    icon: <Settings className="h-5 w-5" />,
    title: "Industrial Engineering",
    items: ["Station design", "Cycle time modeling"],
  },
  {
    icon: <Package className="h-5 w-5" />,
    title: "Manufacturing Ops",
    items: ["RFQ packs", "Equipment selection"],
  },
];

type CustomersClientsSectionProps = {
  embedded?: boolean;
};

const revealProps = (embedded: boolean, delay = 0) =>
  embedded
    ? {}
    : {
        initial: { opacity: 0, y: 16 } as const,
        whileInView: { opacity: 1, y: 0 } as const,
        viewport: { once: true } as const,
        transition: { duration: 0.45, delay },
      };

export function CustomersClientsSection({ embedded = false }: CustomersClientsSectionProps = {}) {
  return (
    <section
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
            ? "factory-customers__shell relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-[calc(var(--site-header-total)+0.375rem)] md:px-6 md:py-[calc(var(--site-header-total)+0.75rem)] lg:px-10"
            : "relative z-10 mx-auto max-w-7xl px-6 md:px-10"
        }
      >
        <div
          className={
            embedded
              ? "factory-customers__main flex min-h-0 flex-1 flex-col justify-start gap-4 md:flex-row md:items-center md:gap-8 lg:gap-10 md:justify-center"
              : "mb-12 flex flex-col gap-8 md:flex-row md:items-center md:gap-10"
          }
        >
          <div
            className={
              embedded
                ? "factory-customers__text flex shrink-0 flex-col space-y-3 md:flex-[0_0_38%] lg:space-y-5"
                : "flex flex-1 flex-col space-y-6 md:flex-[0_0_40%]"
            }
          >
            <motion.div className="flex justify-start" {...revealProps(embedded)}>
              <span className="shiny-badge">Customers</span>
            </motion.div>

            <motion.h2
              className={`factory-customers__heading text-left font-orbitron leading-[1.12] text-white ${
                embedded
                  ? "text-[24px] sm:text-[30px] md:text-[48px] md:leading-tight"
                  : "text-heading"
              }`}
              {...revealProps(embedded, 0.06)}
            >
              Built for manufacturing <span className="text-primary">teams that ship.</span>
            </motion.h2>
          </div>

          <div
            className="factory-customers__cards flex min-w-0 flex-col gap-2 md:flex-1 md:gap-4 lg:gap-5"
          >
            {teams.map((team, index) => (
              <motion.div
                key={team.title}
                {...revealProps(embedded, 0.08 + index * 0.06)}
                className={`factory-customers__card relative rounded-2xl border border-teal-500/20 ${
                  embedded ? "px-5 py-4 md:px-6 md:py-5" : "px-6 py-5 md:px-7 md:py-6"
                }`}
                style={{
                  background:
                    "linear-gradient(180deg, rgba(12,12,14,0.95) 0%, rgba(6,6,8,0.98) 100%)",
                  boxShadow: "0 0 25px rgba(20,184,166,0.05)",
                }}
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl border border-teal-500/30 bg-teal-500/15 text-teal-400 md:h-11 md:w-11">
                    {team.icon}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2 md:gap-2.5">
                    <h3 className="font-orbitron text-[14px] leading-tight text-white md:text-[17px]">
                      {team.title}
                    </h3>

                    <ul className="factory-customers__items flex flex-nowrap items-center gap-x-4 sm:gap-x-5 md:gap-x-6">
                      {team.items.map((item) => (
                        <li
                          key={item}
                          className="flex min-w-0 items-center gap-2 text-[11px] text-teal-300/90 sm:text-[12px] md:gap-2.5 md:text-[13px]"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500/60" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
