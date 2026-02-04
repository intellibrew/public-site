"use client";

import { motion } from "framer-motion";
import { PenTool, Settings, Package } from "lucide-react";
const teams = [
  {
    icon: <PenTool className="w-5 h-5" />,
    title: "Design Engineers",
    items: ["Product integration", "Line specifications", "Technical drawings"],
  },
  {
    icon: <Settings className="w-5 h-5" />,
    title: "Process & Industrial Engineering",
    items: ["Station design", "Cycle time modeling", "Layout iteration"],
  },
  {
    icon: <Package className="w-5 h-5" />,
    title: "Manufacturing Ops & Procurement",
    items: ["RFQ packs", "Equipment selection", "Capacity & bottlenecks"],
  },
];

export function TeamsSection({ onBookDemo }: { onBookDemo?: () => void } = {}) {
  return (
    <section id="teams" className="relative bg-[#080a0f] py-24 overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <motion.h2 
          className="text-center font-orbitron text-[28px] md:text-[42px] leading-tight text-white mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Built for manufacturing teams that ship.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {teams.map((team, index) => (
            <motion.div
              key={team.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative rounded-2xl border border-blue-500/20 p-6 md:p-8"
              style={{
                background: "linear-gradient(180deg, rgba(15,20,35,0.8) 0%, rgba(8,12,25,0.9) 100%)",
                boxShadow: "0 0 25px rgba(59,130,246,0.05)",
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  {team.icon}
                </div>
                <h3 className="text-white font-orbitron text-[15px] md:text-[17px] leading-tight">
                  {team.title}
                </h3>
              </div>

              <ul className="space-y-3">
                {team.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-400 text-[14px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {onBookDemo ? (
            <button
              type="button"
              onClick={onBookDemo}
              className="btn-cta-large inline-flex"
              aria-label="Book a demo"
            >
              <span>Book a demo</span>
            </button>
          ) : (
            <span className="btn-cta-large cursor-default inline-flex" aria-hidden>
              <span>Book a demo</span>
            </span>
          )}
        </motion.div>
      </div>
    </section>
  );
}
