"use client";

import { motion } from "framer-motion";
import { Clock, FileText, Activity } from "lucide-react";

const actionCards = [
  {
    title: "From drawing to layout",
    description: "Auto-generate an editable floor layout from CAD/BOM.",
    badge: "First pass: hours",
    badgeIcon: <Clock className="w-3.5 h-3.5" />,
    video: "/fromdrawingtolayout.mp4",
  },
  {
    title: "RFQs & quotes in 1 flow",
    description: "Generate spec-ready packs and compare vendor options.",
    badge: "RFQ pack: days",
    badgeIcon: <FileText className="w-3.5 h-3.5" />,
    video: "/rfq.mp4",
  },
  {
    title: "Execution at scale",
    description: "Simulate changes and identify constraints before build.",
    badge: "Bottlenecks: visible instantly",
    badgeIcon: <Activity className="w-3.5 h-3.5" />,
    video: "/in-action-operations.mp4",
  },
];

export function InActionSection() {
  return (
    <section id="in-action" className="relative bg-[#080a0f] py-24 overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 50% 30% at 50% 20%, rgba(20,184,166,0.06) 0%, transparent 60%)",
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
          <span className="shiny-badge">In Action</span>
        </motion.div>
        <motion.h2 
          className="text-center text-heading mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          See <span className="text-primary">NeoFab</span> in action
        </motion.h2>

        <motion.div
          className="mx-auto h-1 w-32 md:w-40 rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 mb-6"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        <motion.p 
          className="text-center text-body mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Three moments that collapse months of planning into Hours.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actionCards.map((card) => (
            <div
              key={card.title}
              className="group relative rounded-2xl border border-teal-500/20 p-5 transition-all duration-300 hover:border-teal-500/50 hover:shadow-[0_0_50px_rgba(20,184,166,0.2)]"
              style={{
                background: "linear-gradient(180deg, rgba(12,16,28,0.9) 0%, rgba(8,12,22,0.95) 100%)",
                boxShadow: "0 0 25px rgba(20,184,166,0.06)",
              }}
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5 border border-teal-500/20">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={card.video} type="video/mp4" />
                </video>
              </div>

              <h3 className="text-subheading mb-2 group-hover:text-teal-400 transition-colors">
                {card.title}
              </h3>

              <p className="text-body mb-4">
                {card.description}
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10">
                <span className="text-teal-400">{card.badgeIcon}</span>
                <span className="text-teal-300 text-[12px] font-medium">
                  {card.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
