"use client";

import { motion } from "framer-motion";
import { Box, Link2, FileOutput } from "lucide-react";

const whatItDoes = [
  {
    icon: <Box className="w-4 h-4" />,
    text: "Generates a linked production line model from your inputs.",
  },
  {
    icon: <Link2 className="w-4 h-4" />,
    text: "Connects stations, machines, cycle times, and cost in one system.",
  },
  {
    icon: <FileOutput className="w-4 h-4" />,
    text: "Exports artifacts teams can use immediately (RFQs, CAPEX, layouts).",
  },
];

const whatYouGet = [
  "Layout",
  "Stations",
  "RFQ pack",
  "CAPEX/OPEX ",
  "Scenario Comparison",
];

const builtBy = [
  "Founders are veterans in manufacturing and AI, and have led teams at Amazon, Rivian, Ola, and Ather.",
  "World-class engineers and operators building the system end-to-end-from line modeling to execution artifacts.",
  "Obsessed with throughput, cost, and time-to-build-not dashboards.",
];

export function AboutSection() {
  return (
    <section id="about" className="relative z-10 py-24 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(20,184,166,0.06) 0%, transparent 55%)",
        }}
      />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <span className="shiny-badge">About</span>
          </motion.div>
          <h2 className="text-heading mb-4 font-orbitron">
            About NeoFab
          </h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-primary" />
        </motion.div>

        <motion.div
          className="rounded-2xl border border-teal-500/20 p-6 md:p-8 mb-6"
          style={{
            background: "linear-gradient(180deg, rgba(12,16,28,0.8) 0%, rgba(8,12,22,0.9) 100%)",
            boxShadow: "0 0 30px rgba(20,184,166,0.06)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-subheading mb-6 font-orbitron">
            What it does
          </h3>
          <ul className="space-y-4">
            {whatItDoes.map((item, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center flex-shrink-0 text-teal-400">
                  {item.icon}
                </div>
                <span className="text-body pt-1">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-teal-500/20 p-6 md:p-8 mb-6"
          style={{
            background: "linear-gradient(180deg, rgba(12,16,28,0.8) 0%, rgba(8,12,22,0.9) 100%)",
            boxShadow: "0 0 30px rgba(20,184,166,0.06)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-subheading mb-5 font-orbitron">
            What you get
          </h3>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {whatYouGet.map((item) => (
              <span
                key={item}
                className="px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/5 text-body text-[13px] font-orbitron"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="text-body">
            <span className="text-teal-400">Inputs → Outputs:</span> Upload CAD + BOM + specs → get a complete line model and exportable planning artifacts.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-teal-500/20 p-6 md:p-8"
          style={{
            background: "linear-gradient(180deg, rgba(12,16,28,0.8) 0%, rgba(8,12,22,0.9) 100%)",
            boxShadow: "0 0 30px rgba(20,184,166,0.06)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-subheading mb-6 font-orbitron">
            Built by operators and engineers
          </h3>
          <ul className="space-y-4">
            {builtBy.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-2" />
                <span className="text-body">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
