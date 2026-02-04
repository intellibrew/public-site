"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Plus, Minus } from "lucide-react";
import { useState } from "react";
import type { FC, PropsWithChildren } from "react";

const SafeAnimatePresence = AnimatePresence as FC<PropsWithChildren<{ mode?: "wait" | "sync" | "popLayout" }>>;

const faqs = [
  {
    question: "How accurate are the layouts NeoFab generates?",
    answer: "NeoFab generates layouts with high precision based on your CAD inputs and industry standards. Our AI considers material flow, ergonomics, safety regulations, and optimal station placement to create production-ready layouts that typically require minimal adjustments.",
  },
  {
    question: "Can NeoFab optimize an existing factory setup?",
    answer: "Yes, NeoFab can analyze your existing factory layout and suggest optimizations. Upload your current floor plans and production data, and our AI will identify bottlenecks, inefficiencies, and opportunities for improvement without requiring a complete redesign.",
  },
  {
    question: "How much time does it save compared to traditional planning?",
    answer: "Traditional factory planning typically takes 6-10 weeks with a team of engineers. NeoFab can generate a complete first-pass line model in 2-6 hours, reducing planning time by up to 95% while maintaining or improving quality.",
  },
  {
    question: "What kind of products or industries does NeoFab support?",
    answer: "NeoFab supports discrete manufacturing across automotive, electronics, consumer goods, aerospace, and industrial equipment sectors. Whether you're building EV batteries, consumer electronics, or heavy machinery, our AI adapts to your specific production requirements.",
  },
  {
    question: "How does NeoFab help reduce costs?",
    answer: "NeoFab reduces costs in multiple ways: faster planning cycles, optimized layouts that minimize material travel by 15-40%, accurate CAPEX/OPEX projections, automated RFQ generation that cuts procurement time, and bottleneck identification before you build.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative z-10 py-24 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 10%, rgba(59,130,246,0.06) 0%, transparent 55%)",
        }}
      />

      <div className="mx-auto max-w-3xl px-6 relative z-10">
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="shiny-badge">
            FAQ
          </span>
        </motion.div>

        <motion.h2 
          className="text-center font-orbitron text-[28px] md:text-[42px] leading-tight text-white mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Your questions, answered
        </motion.h2>

        <motion.div
          className="divide-y divide-blue-500/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {faqs.map((faq, index) => (
            <div key={index} className="py-5">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between gap-4 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-full border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-white font-medium text-[15px] font-sans group-hover:text-blue-400 transition-colors">
                    {faq.question}
                  </span>
                </div>
                <motion.div 
                  className="flex-shrink-0 text-slate-500 group-hover:text-blue-400"
                  animate={{ 
                    rotate: openIndex === index ? 180 : 0,
                    scale: openIndex === index ? 1.1 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  {openIndex === index ? (
                    <Minus className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </motion.div>
              </button>

              <SafeAnimatePresence mode="wait">
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: "auto", 
                      opacity: 1,
                      transition: {
                        height: {
                          type: "spring",
                          stiffness: 100,
                          damping: 20,
                          mass: 0.8,
                        },
                        opacity: {
                          duration: 0.25,
                          delay: 0.1,
                        },
                      },
                    }}
                    exit={{ 
                      height: 0, 
                      opacity: 0,
                      transition: {
                        height: {
                          type: "spring",
                          stiffness: 120,
                          damping: 22,
                        },
                        opacity: {
                          duration: 0.15,
                        },
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div 
                      className="pt-4 pl-11"
                      initial={{ y: -8 }}
                      animate={{ y: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 150, 
                        damping: 18,
                        delay: 0.05,
                      }}
                    >
                      <p className="text-slate-400 text-[14px] leading-relaxed font-sans">
                        {faq.answer}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </SafeAnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
