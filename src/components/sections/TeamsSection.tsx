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
    title: "Industrial Engineering",
    items: ["Station design", "Cycle time modeling", "Layout iteration"],
  },
  {
    icon: <Package className="w-5 h-5" />,
    title: "Manufacturing Ops ",
    items: ["RFQ packs", "Equipment selection", "Capacity & bottlenecks"],
  },
];

export function TeamsSection({ onBookDemo }: { onBookDemo?: () => void } = {}) {
  return (
    <section id="teams" className="relative bg-[#060608] py-24 overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 55%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="shiny-badge">Teams</span>
        </motion.div>
        <motion.h2 
          className="text-center text-heading mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
              className="relative rounded-2xl border border-teal-500/20 p-6 md:p-8"
              style={{
                background: "linear-gradient(180deg, rgba(12,12,14,0.95) 0%, rgba(6,6,8,0.98) 100%)",
                boxShadow: "0 0 25px rgba(20,184,166,0.05)",
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  {team.icon}
                </div>
                <h3 className="font-orbitron text-white text-[16px] md:text-[18px] leading-tight">
                  {team.title}
                </h3>
              </div>

              <ul className="space-y-3">
                {team.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-teal-300/90 text-[14px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500/60 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
