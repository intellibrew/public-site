"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock3, GitBranch, FileText } from "lucide-react";
import { AnimateInView } from "@/components/AnimateInView";
import AdvancedFactoryAnimation from "@/components/AdvancedFactoryAnimation";

export function ProblemToSolutionTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const logoScale = useTransform(scrollYProgress, [0.05, 0.25, 0.5], [0.3, 1, 1.1]);
  const logoOpacity = useTransform(scrollYProgress, [0.05, 0.2, 0.45, 0.6], [0, 1, 1, 0]);
  
  const contentOpacity = useTransform(scrollYProgress, [0.08, 0.25], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0.08, 0.3], [0, -80]);
  const contentScale = useTransform(scrollYProgress, [0.08, 0.25], [1, 0.85]);
  
  const auraScale = useTransform(scrollYProgress, [0.15, 0.4, 0.55], [1, 2.5, 10]);
  const auraOpacity = useTransform(scrollYProgress, [0.1, 0.25, 0.5, 0.6], [0, 0.8, 0.5, 0]);
  
  const blueOverlayOpacity = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 0.95, 0]);

  return (
    <div ref={containerRef} className="relative h-[100vh] overflow-x-hidden">
      <div className="sticky top-0 h-screen overflow-x-hidden">
        <section
          id="problem"
          className="relative h-full w-full bg-[#080a0f] border-t border-white/5 overflow-x-hidden"
        >
          <motion.div 
            className="relative z-10 mx-auto flex max-w-7xl w-full h-full flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:px-10 md:py-20 origin-center box-border"
            style={{ 
              opacity: contentOpacity, 
              y: contentY,
              scale: contentScale,
            }}
          >
            <div className="flex-1 space-y-6">
              <AnimateInView>
                <span className="shiny-badge-red">Problem</span>
              </AnimateInView>
              <AnimateInView delay={60}>
                <h2 className="font-orbitron text-[28px] leading-[1.2] text-white md:text-[40px]">
                  Factory planning is
                  <br />
                  still slow, manual,
                  <br />
                  and dated.
                </h2>
              </AnimateInView>
              <AnimateInView delay={120}>
                <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                  {[
                    {
                      label: "Weeks of back-and-forth.",
                      icon: <Clock3 className="h-3.5 w-3.5" />,
                    },
                    {
                      label: "Decisions scattered without a single model.",
                      icon: <GitBranch className="h-3.5 w-3.5" />,
                    },
                    {
                      label: "Design-to-RFQs start too late, costs drift.",
                      icon: <FileText className="h-3.5 w-3.5" />,
                    },
                  ].map(({ label, icon }, index) => (
                    <motion.li 
                      key={label} 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    >
                      <motion.span 
                        className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-2xl border border-[#fb7185]/60 bg-[radial-gradient(circle_at_30%_0%,rgba(252,165,165,0.38),rgba(127,29,29,0.95))] text-[#fecaca] shadow-[0_10px_30px_-18px_rgba(248,113,113,0.95)]"
                        whileHover={{ 
                          scale: 1.1, 
                          boxShadow: "0 0 25px rgba(248,113,113,0.6)",
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-[#fda4af]">
                          {icon}
                        </span>
                      </motion.span>
                      <span>{label}</span>
                    </motion.li>
                  ))}
                </ul>
              </AnimateInView>
            </div>

            <div className="flex-1 flex items-center justify-center relative min-w-0 w-full max-w-full overflow-hidden">
              <AdvancedFactoryAnimation />
            </div>
          </motion.div>

          <motion.div
            className="absolute left-1/2 top-1/2 pointer-events-none z-30 flex items-center justify-center"
            style={{ 
              x: "-50%",
              y: "-50%",
              scale: logoScale,
              opacity: logoOpacity,
            }}
          >
            <motion.div
              className="absolute w-[250px] h-[250px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(59,130,246,0.2) 40%, transparent 70%)",
                scale: auraScale,
                opacity: auraOpacity,
                filter: "blur(40px)",
              }}
            />

            <motion.div 
              className="relative w-[160px] h-[160px] flex items-center justify-center"
              style={{
                filter: "drop-shadow(0 0 30px rgba(59,130,246,0.8)) drop-shadow(0 0 60px rgba(59,130,246,0.4))",
              }}
            >
              <Image
                src="/neofab-icon-transparent.png"
                alt="NeoFab"
                width={140}
                height={140}
                className="object-contain"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute inset-0 pointer-events-none z-40"
            style={{ 
              opacity: blueOverlayOpacity,
              background: "radial-gradient(circle at center, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.15) 40%, rgba(8,10,15,0.95) 100%)",
            }}
          />

        </section>
      </div>
    </div>
  );
}
